import type { ChatTurnResult } from './chat-turn-result';
import type { CategoryTeamsReply } from './resolve-category-teams-reply';
import { ASK_GENDER_MESSAGE } from './category-teams-intent';
import { chatTurnResult } from './chat-turn-result';

/** Flatten ensureCategoryTeamsReply into a chat turn result. */
export function categoryTeamsTurnResult(
  reply: CategoryTeamsReply,
): ChatTurnResult | null {
  if (reply.status === 'ask-gender') {
    return chatTurnResult(ASK_GENDER_MESSAGE);
  }

  if (reply.status === 'text') {
    return chatTurnResult(reply.text, reply.pending);
  }

  return null;
}
