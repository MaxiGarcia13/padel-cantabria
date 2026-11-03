import type { PendingClarification } from '@chat/domain/clarification';
import { computed, onMounted, ref } from 'vue';

interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatTurnResponse {
  text: string;
  pending?: PendingClarification;
}

const WELCOME_MESSAGE
  = 'Puedes preguntar por categorías, equipos, posiciones, jugadores y próximos partidos.';

const MAX_HISTORY_MESSAGES = 4;

function createMessageId(): string {
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function trimHistory(history: HistoryMessage[]): HistoryMessage[] {
  if (history.length <= MAX_HISTORY_MESSAGES) {
    return history;
  }
  return history.slice(-MAX_HISTORY_MESSAGES);
}

export function useAssistantChat() {
  const status = ref('Preparando…');
  const statusTone = ref<'info' | 'error'>('info');
  const ready = ref(false);
  const busy = ref(false);
  const messages = ref<ChatUiMessage[]>([]);
  const history = ref<HistoryMessage[]>([]);
  const pendingClarification = ref<PendingClarification | null>(null);

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
    history.value = trimHistory([
      ...history.value,
      { role: 'user', content: userText },
      { role: 'assistant', content: assistantText },
    ]);
  }

  function start() {
    ready.value = true;
    statusTone.value = 'info';
    status.value = 'Listo';
    pushMessage('system', WELCOME_MESSAGE);
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
      const response = await fetch('/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userMessage: trimmed,
          history: history.value,
          pending: pendingClarification.value,
        }),
      });

      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        const message
          = payload
            && typeof payload === 'object'
            && 'error' in payload
            && typeof (payload as { error: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : response.statusText;
        throw new Error(message);
      }

      if (
        !payload
        || typeof payload !== 'object'
        || typeof (payload as ChatTurnResponse).text !== 'string'
      ) {
        throw new Error('Invalid chat turn response');
      }

      const result = payload as ChatTurnResponse;
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
    start();
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
