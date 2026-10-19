import { ASK_GENDER_MESSAGE } from './category-teams-intent';
import type { CategoryTeamsReply } from './resolve-category-teams-reply';

/** Flatten ensureCategoryTeamsReply into a user-visible string. */
export function categoryTeamsReplyText(
  reply: CategoryTeamsReply,
): string | null {
  if (reply.status === 'ask-gender') {
    return ASK_GENDER_MESSAGE;
  }

  if (reply.status === 'text') {
    return reply.text;
  }

  return null;
}
