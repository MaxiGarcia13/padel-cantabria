import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { McpBrowserClient } from './mcp-client';
import { sanitizeToolArgs } from './sanitize-tool-args';
import { formatToolResultFallback } from './tool-result-fallback';

/** Enough for search → follow-up tool; last round forces a text answer. */
const MAX_TOOL_ROUNDS = 3;

/**
 * Hermes function-calling injects its own system prompt; a custom `system`
 * message is rejected when `tools` is set. Keep guidance in the user turn.
 */
/** English saves tokens; reply language follows the user question. */
const USER_GUIDANCE = `Reply in the user's language. Be clear and brief.
Use tools for real data only. Never invent results, args, teams, or players.
Ignore prior turns unless the user refers to them ("that team", "the previous one").
League is fixed by the server.

Tools:
- Teams in a category/group → search_categories (pass gender M/F only if the user said it), then list_teams with category_value + gender. Not list_categories or search_teams.
- One category lookup → search_categories. Full catalog only → list_categories.
- Team by name → search_teams. Player by name → search_players (query only; gender only if user said M/F). If gender is ambiguous, ask M or F.
- When a tool result already has the asked data (e.g. teams[]), answer in text; do not call more tools.`;

const AFTER_TOOLS_NUDGE
  = 'Reply in the user\'s language only if the last tool result already has the asked data (teams, players, etc.). If you only have categories/ids and still need teams or another fact, call the missing tool. Do not invent or reuse prior-turn facts.';

const SUMMARIZE_TOOL_NUDGE
  = 'In the user\'s language, briefly summarize only what is in the last tool result. Do not invent teams or players. Do not call more tools.';

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

async function completeForcedText(
  engine: MLCEngineInterface,
  messages: ChatCompletionMessageParam[],
): Promise<string | null> {
  const completion = await engine.chat.completions.create({
    messages: withoutSystemMessages(messages),
    tool_choice: 'none' as const,
  });

  return completion.choices[0]?.message?.content?.trim() || null;
}

async function resolveEmptyModelReply(options: {
  engine: MLCEngineInterface;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<string> {
  if (options.toolResults.length === 0) {
    return 'No he encontrado una respuesta.';
  }

  const summarizeMessages: ChatCompletionMessageParam[] = [
    ...options.messages,
    { role: 'user', content: SUMMARIZE_TOOL_NUDGE },
  ];

  const summarized = await completeForcedText(
    options.engine,
    summarizeMessages,
  );

  if (summarized) {
    return summarized;
  }

  return formatToolResultFallback(options.toolResults);
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
      content: `${USER_GUIDANCE}\n\nQuestion: ${options.userMessage}`,
    },
  ];
  const toolResults: string[] = [];

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
      if (toolResults.length > 0) {
        return formatToolResultFallback(toolResults);
      }
      return 'No he podido generar una respuesta.';
    }

    const toolCalls = forceTextAnswer ? [] : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      const content = message.content?.trim();
      if (content) {
        return content;
      }

      return resolveEmptyModelReply({
        engine: options.engine,
        messages,
        toolResults,
      });
    }

    messages.push({
      role: 'assistant',
      // Hermes/WebLLM require string content even when only tool_calls are set.
      content: message.content ?? '',
      tool_calls: toolCalls,
    });

    for (const toolCall of toolCalls) {
      const name = toolCall.function.name;
      const args = sanitizeToolArgs(
        parseToolArguments(toolCall.function.arguments),
      );
      const toolText = await options.mcp.callTool(name, args);
      toolResults.push(toolText);

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

  if (toolResults.length > 0) {
    return formatToolResultFallback(toolResults);
  }

  return 'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.';
}
