import type { ChatResult } from './chat-result.js';
import type { PendingGenderClarification } from './clarification.js';
import type { CategoryTeamsReply } from './resolve-category-teams-reply.js';
import { ASK_GENDER_MESSAGE } from './category-teams-intent.js';
import { chatResult } from './chat-result.js';

function genderPending(originalQuestion: string): PendingGenderClarification {
  return { kind: 'gender', originalQuestion };
}

export function categoryTeamsResult(
  reply: CategoryTeamsReply,
  originalQuestion?: string,
): ChatResult | null {
  if (reply.status === 'ask-gender') {
    return chatResult(
      ASK_GENDER_MESSAGE,
      originalQuestion
        ? genderPending(originalQuestion)
        : undefined,
    );
  }

  if (reply.status === 'text') {
    return chatResult(reply.text, reply.pending);
  }

  return null;
}
