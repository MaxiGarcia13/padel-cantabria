import type { ChatTurnResult } from './chat-turn-result';
import type { PendingGenderClarification } from './clarification';
import type { CategoryTeamsReply } from './resolve-category-teams-reply';
import { ASK_GENDER_MESSAGE } from './category-teams-intent';
import { chatTurnResult } from './chat-turn-result';

function genderPending(originalQuestion: string): PendingGenderClarification {
  return { kind: 'gender', originalQuestion };
}

export function categoryTeamsTurnResult(
  reply: CategoryTeamsReply,
  originalQuestion?: string,
): ChatTurnResult | null {
  if (reply.status === 'ask-gender') {
    return chatTurnResult(
      ASK_GENDER_MESSAGE,
      originalQuestion ? genderPending(originalQuestion) : undefined,
    );
  }

  if (reply.status === 'text') {
    return chatTurnResult(reply.text, reply.pending);
  }

  return null;
}
