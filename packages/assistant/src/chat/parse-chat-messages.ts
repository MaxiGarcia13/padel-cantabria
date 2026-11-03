import type { ChatCompletionMessageParam } from './utils/chat-completion-types.js';

const MAX_HISTORY_MESSAGES = 4;

type HistoryMessage = Extract<
  ChatCompletionMessageParam,
  { role: 'user' | 'assistant' }
>;

function isHistoryMessage(value: unknown): value is HistoryMessage {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as { role?: unknown; content?: unknown };
  return (
    (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
  );
}

export function parseChatMessages(messages: unknown): {
  userMessage: string;
  history: HistoryMessage[];
} {
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error('messages must be a non-empty array');
  }

  const conversation = messages.filter(isHistoryMessage);
  const last = conversation.at(-1);

  if (!last || last.role !== 'user' || !last.content.trim()) {
    throw new Error('messages must end with a non-empty user message');
  }

  const prior = conversation.slice(0, -1);
  const history = prior.length <= MAX_HISTORY_MESSAGES
    ? prior
    : prior.slice(-MAX_HISTORY_MESSAGES);

  return {
    userMessage: last.content.trim(),
    history,
  };
}
