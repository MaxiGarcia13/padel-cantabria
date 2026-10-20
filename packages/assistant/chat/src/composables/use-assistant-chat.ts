import type { PendingClarification } from '../domain/clarification';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from '../utils/chat-completion-types';
import { computed, onMounted, ref } from 'vue';
import { resolveUserMessage } from '../domain/resolve-user-message';
import { HttpChatCompletionsClient } from '../utils/chat-completions-client';
import { McpBrowserClient } from '../utils/mcp';
import { trimChatHistory } from '../utils/trim-chat-history';

interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const WELCOME_MESSAGE
  = 'Puedes preguntar por categorías, equipos, posiciones, jugadores y próximos partidos.';

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function useAssistantChat() {
  const status = ref('Preparando…');
  const statusTone = ref<'info' | 'error'>('info');
  const ready = ref(false);
  const busy = ref(false);
  const messages = ref<ChatUiMessage[]>([]);
  const history = ref<ChatCompletionMessageParam[]>([]);
  const pendingClarification = ref<PendingClarification | null>(null);

  const mcp = new McpBrowserClient('/mcp');
  const chatClient = new HttpChatCompletionsClient('/chat/completions');
  let tools: ChatCompletionTool[] = [];

  const canSend = computed(() => ready.value && !busy.value);

  function pushMessage(role: ChatUiMessage['role'], content: string) {
    messages.value.push({
      id: createMessageId(),
      role,
      content,
    });
  }

  function commitTurn(userText: string, assistantText: string) {
    pushMessage('assistant', assistantText);
    history.value = trimChatHistory([
      ...history.value,
      { role: 'user', content: userText },
      { role: 'assistant', content: assistantText },
    ]);
  }

  async function start() {
    try {
      status.value = 'Conectando al MCP…';
      await mcp.connect();
      const mcpTools = await mcp.listTools();
      tools = mcp.toOpenAiTools(mcpTools);

      ready.value = true;
      statusTone.value = 'info';
      status.value = `Listo · ${mcpTools.length} herramientas MCP`;
      pushMessage('system', WELCOME_MESSAGE);
    } catch (error) {
      statusTone.value = 'error';
      status.value
        = error instanceof Error
          ? error.message
          : 'No se pudo iniciar el asistente';
    }
  }

  async function send(prompt: string) {
    if (!canSend.value) {
      return;
    }

    const trimmed = prompt.trim();
    if (!trimmed) {
      return;
    }

    busy.value = true;
    pushMessage('user', trimmed);

    try {
      const result = await resolveUserMessage({
        client: chatClient,
        mcp,
        tools,
        history: history.value,
        pending: pendingClarification.value,
        userMessage: trimmed,
      });

      pendingClarification.value = result.pending ?? null;
      commitTurn(trimmed, result.text);
    } catch (error) {
      pendingClarification.value = null;
      pushMessage(
        'assistant',
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Ha ocurrido un error al responder.',
      );
    } finally {
      busy.value = false;
    }
  }

  onMounted(() => {
    void start();
  });

  return {
    status,
    statusTone,
    busy,
    messages,
    canSend,
    send,
  };
}
