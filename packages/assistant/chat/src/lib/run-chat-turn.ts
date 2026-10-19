import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { McpBrowserClient } from './mcp-client';

/** Enough for search → follow-up tool; last round forces a text answer. */
const MAX_TOOL_ROUNDS = 3;

/**
 * Hermes function-calling injects its own system prompt; a custom `system`
 * message is rejected when `tools` is set. Keep guidance in the user turn.
 */
const USER_GUIDANCE = `Responde en español, de forma clara y breve.
Usa las herramientas solo cuando necesites datos reales. No inventes resultados ni parámetros.
Para buscar un jugador, llama search_players solo con query (nombre). No envíes gender salvo que el usuario diga masculino/femenino; nunca uses omit o unknown.
Si hay varias coincidencias de género, pregunta: ¿masculino (M) o femenino (F)?
Cuando el resultado de una herramienta ya responde la pregunta (p. ej. team_name), contesta en texto y NO llames más herramientas.
La liga la fija el servidor.`;

const AFTER_TOOLS_NUDGE
  = 'Si el resultado anterior ya responde la pregunta, contesta ahora en español sin llamar más herramientas. Solo usa otra herramienta si falta un dato concreto que no esté en el resultado.';

function parseToolArguments(raw: string | undefined): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return { raw };
  }

  return {};
}

function withoutSystemMessages(
  messages: ChatCompletionMessageParam[],
): ChatCompletionMessageParam[] {
  return messages.filter((message) => message.role !== 'system');
}

function formatToolResult(name: string, toolText: string): string {
  return `Resultado de ${name}:\n${toolText}`;
}

export async function runChatTurn(options: {
  engine: MLCEngineInterface;
  mcp: McpBrowserClient;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  userMessage: string;
}): Promise<string> {
  const messages: ChatCompletionMessageParam[] = [
    ...withoutSystemMessages(options.history),
    {
      role: 'user',
      content: `${USER_GUIDANCE}\n\nPregunta: ${options.userMessage}`,
    },
  ];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const forceTextAnswer = round === MAX_TOOL_ROUNDS - 1;

    // WebLLM mutates `request.messages` by unshifting its Hermes system prompt.
    // Pass a fresh copy without any system role so later tool rounds do not fail.
    const completion = await options.engine.chat.completions.create({
      messages: withoutSystemMessages(messages),
      ...(forceTextAnswer
        ? { tool_choice: 'none' as const }
        : { tools: options.tools, tool_choice: 'auto' as const }),
    });

    const message = completion.choices[0]?.message;

    if (!message) {
      return 'No he podido generar una respuesta.';
    }

    const toolCalls = forceTextAnswer ? [] : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      return message.content?.trim() || 'No he encontrado una respuesta.';
    }

    messages.push({
      role: 'assistant',
      // Hermes/WebLLM require string content even when only tool_calls are set.
      content: message.content ?? '',
      tool_calls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      const args = parseToolArguments(toolCall.function.arguments);
      const toolText = await options.mcp.callTool(name, args);

      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: formatToolResult(name, toolText),
      });
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
  }

  return 'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.';
}
