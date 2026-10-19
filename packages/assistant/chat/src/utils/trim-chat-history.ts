import type { ChatCompletionMessageParam } from './chat-completion-types';

/** How many prior user+assistant pairs the model may see. */
const MAX_HISTORY_TURNS = 2;

/**
 * Keep only the last N chat turns for the model context.
 * UI can still show the full transcript separately.
 */
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
