import type { PendingClarification } from './clarification.js';

export interface ChatTurnResult {
  text: string;
  pending?: PendingClarification;
}

export function chatTurnResult(
  text: string,
  pending?: PendingClarification,
): ChatTurnResult {
  return pending
    ? { text, pending }
    : { text };
}
