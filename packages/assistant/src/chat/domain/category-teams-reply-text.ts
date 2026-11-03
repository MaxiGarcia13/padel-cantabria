import type { ChatTurnResult } from './chat-turn-result.js';
import type { PendingGenderClarification } from './clarification.js';
import type { CategoryTeamsReply } from './resolve-category-teams-reply.js';
import { ASK_GENDER_MESSAGE } from './category-teams-intent.js';
import { chatTurnResult } from './chat-turn-result.js';

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
      originalQuestion
        ? genderPending(originalQuestion)
        : undefined,
    );
  }

  if (reply.status === 'text') {
    return chatTurnResult(reply.text, reply.pending);
  }

  return null;
}
