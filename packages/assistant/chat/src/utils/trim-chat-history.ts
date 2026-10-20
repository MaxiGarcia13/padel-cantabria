import type { ChatCompletionMessageParam } from './chat-completion-types';

const MAX_HISTORY_TURNS = 2;

export function trimChatHistory(
  history: ChatCompletionMessageParam[],
  maxTurns = MAX_HISTORY_TURNS,
): ChatCompletionMessageParam[] {
  const maxMessages = Math.max(0, maxTurns) * 2;

  if (maxMessages === 0 || history.length <= maxMessages) {
    return history;
  }

  return history.slice(-maxMessages);
}
