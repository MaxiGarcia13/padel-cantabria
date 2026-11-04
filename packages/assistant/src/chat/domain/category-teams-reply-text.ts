import type { ChatResult } from './chat-result.js';
import type { CategoryTeamsReply } from './resolve-category-teams-reply.js';
import { askGenderResult } from './ask-gender-result.js';
import { ASK_GENDER_MESSAGE } from './category-teams-intent.js';
import { chatResult } from './chat-result.js';

export function categoryTeamsResult(
  reply: CategoryTeamsReply,
  originalQuestion?: string,
): ChatResult | null {
  if (reply.status === 'ask-gender') {
    return originalQuestion
      ? askGenderResult(originalQuestion)
      : chatResult(ASK_GENDER_MESSAGE);
  }

  if (reply.status === 'text') {
    return chatResult(reply.text, reply.pending);
  }

  return null;
}
