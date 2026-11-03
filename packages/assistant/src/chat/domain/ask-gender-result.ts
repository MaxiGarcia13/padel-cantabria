import type { ChatResult } from './chat-result.js';
import type { PendingGenderClarification } from './clarification.js';
import { ASK_GENDER_MESSAGE } from './category-teams-intent.js';
import { chatResult } from './chat-result.js';

export function askGenderResult(originalQuestion: string): ChatResult {
  const pending: PendingGenderClarification = {
    kind: 'gender',
    originalQuestion,
  };
  return chatResult(ASK_GENDER_MESSAGE, pending);
}
