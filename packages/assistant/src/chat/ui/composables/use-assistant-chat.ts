import { CHAT_SESSION_HEADER } from '@chat/chat-session';
import { createChat } from '@maxigarcia/ai-client';
import { computed, onScopeDispose, shallowRef } from 'vue';

const WELCOME_MESSAGE
  = 'Puedes preguntar por categorías, equipos, posiciones, jugadores y próximos partidos.';

const SESSION_STORAGE_KEY = 'padel-assistant-chat-session';

function getOrCreateSessionId(): string {
  const existing = sessionStorage.getItem(SESSION_STORAGE_KEY);
  if (existing) {
    return existing;
  }

  const sessionId = crypto.randomUUID();
  sessionStorage.setItem(SESSION_STORAGE_KEY, sessionId);
  return sessionId;
}

export function useAssistantChat() {
  const chat = createChat({
    url: '/chat',

    initialMessages: [
      { role: 'system', content: WELCOME_MESSAGE },
    ],

    headers: {
      [CHAT_SESSION_HEADER]: getOrCreateSessionId(),
      Accept: 'application/x-ndjson',
    },
  });

  const rawMessages = shallowRef(chat.getState().messages);
  const loading = shallowRef(chat.getState().loading);
  const error = shallowRef(chat.getState().error);

  const unsubscribe = chat.subscribe(() => {
    const state = chat.getState();
    rawMessages.value = state.messages;
    loading.value = state.loading;
    error.value = state.error;
  });

  onScopeDispose(unsubscribe);

  const messages = computed(() =>
    rawMessages.value.map((message, index) => ({
      id: `msg-${index}`,
      role: message.role,
      content: message.content,
    })),
  );

  const busy = computed(() => loading.value);
  const canSend = computed(() => !loading.value);

  const statusTone = computed<'info' | 'error'>(() =>
    error.value ? 'error' : 'info',
  );

  const status = computed(() => {
    if (loading.value) {
      return 'Pensando…';
    }
    if (error.value) {
      return 'Error';
    }
    return 'Listo';
  });

  async function send(prompt: string) {
    const trimmed = prompt.trim();
    if (!trimmed || loading.value) {
      return;
    }

    await chat.send(trimmed);

    const state = chat.getState();
    if (!state.error) {
      return;
    }

    const nextMessages = [...state.messages];
    const last = nextMessages.at(-1);
    if (last?.role === 'assistant' && !last.content) {
      last.content = `Error: ${state.error.message}`;
      chat.setMessages(nextMessages);
    }
  }

  return {
    status,
    statusTone,
    busy,
    messages,
    canSend,
    send,
  };
}
