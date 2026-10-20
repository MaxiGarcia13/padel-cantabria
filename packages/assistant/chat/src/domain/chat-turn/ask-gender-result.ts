import type { ChatTurnResult } from '../chat-turn-result';
import type { PendingGenderClarification } from '../clarification';
import { ASK_GENDER_MESSAGE } from '../category-teams-intent';
import { chatTurnResult } from '../chat-turn-result';

export function askGenderResult(originalQuestion: string): ChatTurnResult {
  const pending: PendingGenderClarification = {
    kind: 'gender',
    originalQuestion,
  };
  return chatTurnResult(ASK_GENDER_MESSAGE, pending);
}
