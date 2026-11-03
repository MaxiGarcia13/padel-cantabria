import type { ChatCompletionChunk } from '../complete-chat.js';
import type { PendingClarification } from './clarification.js';

export interface ChatOutcome {
  chunks: AsyncIterable<ChatCompletionChunk>;
  pending?: PendingClarification;
}

export function chatOutcome(
  chunks: AsyncIterable<ChatCompletionChunk>,
  pending?: PendingClarification,
): ChatOutcome {
  return pending
    ? { chunks, pending }
    : { chunks };
}
