import type { PendingClarification } from './clarification.js';

export interface ChatResult {
  text: string;
  pending?: PendingClarification;
}

export function chatResult(
  text: string,
  pending?: PendingClarification,
): ChatResult {
  return pending
    ? { text, pending }
    : { text };
}
