import type { PendingClarification } from '@chat/domain/clarification';
import { computed, onMounted, ref } from 'vue';
import {
  readOpenAiNdjsonStream,
  readPendingHeader,
} from '@/utils/read-openai-ndjson-stream';

interface ChatUiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

interface HistoryMessage {
  role: 'user' | 'assistant';
  content: string;
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

function asPendingClarification(value: unknown): PendingClarification | null {
  if (!value || typeof value !== 'object') {
    return null;
  }
  return value as PendingClarification;
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

  function commitHistory(userText: string, assistantText: string) {
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
    statusTone.value = 'info';
    status.value = 'Pensando…';
    pushMessage('user', trimmed);
    pushMessage('assistant', '');
    const assistantIndex = messages.value.length - 1;

    try {
      const response = await fetch('/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/x-ndjson',
        },
        body: JSON.stringify({
          userMessage: trimmed,
          history: history.value,
          pending: pendingClarification.value,
        }),
      });

      if (!response.ok) {
        const payload: unknown = await response.json().catch(() => null);
        const message
          = payload
            && typeof payload === 'object'
            && 'error' in payload
            && typeof (payload as { error: unknown }).error === 'string'
            ? (payload as { error: string }).error
            : response.statusText;
        throw new Error(message);
      }

      const finalText = await readOpenAiNdjsonStream(response, (delta) => {
        const current = messages.value[assistantIndex];
        if (current) {
          current.content += delta;
        }
      });

      if (!finalText) {
        throw new Error('Empty chat response');
      }

      pendingClarification.value = asPendingClarification(
        readPendingHeader(response),
      );
      commitHistory(trimmed, finalText);
      status.value = 'Listo';
    } catch (error) {
      pendingClarification.value = null;
      const message = error instanceof Error
        ? `Error: ${error.message}`
        : 'Ha ocurrido un error al responder.';
      const current = messages.value[assistantIndex];
      if (current) {
        current.content = message;
      } else {
        pushMessage('assistant', message);
      }
      statusTone.value = 'error';
      status.value = 'Error';
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
