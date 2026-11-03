import type { ChatTurnResult } from '../chat-turn-result.js';
import type { PendingGenderClarification } from '../clarification.js';
import { ASK_GENDER_MESSAGE } from '../category-teams-intent.js';
import { chatTurnResult } from '../chat-turn-result.js';

export function askGenderResult(originalQuestion: string): ChatTurnResult {
  const pending: PendingGenderClarification = {
    kind: 'gender',
    originalQuestion,
  };
  return chatTurnResult(ASK_GENDER_MESSAGE, pending);
}
