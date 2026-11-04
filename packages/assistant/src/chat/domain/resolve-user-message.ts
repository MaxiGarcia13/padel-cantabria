import type { CallTool } from '@chat/call-tool.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from '@chat/utils/chat-completion-types.js';
import type { ChatOutcome } from './chat-outcome.js';
import type { PendingClarification } from './clarification.js';
import { inferGenderFromText } from '@padel-cantabria/shared';
import { contentChunks } from '../content-chunks.js';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
} from './category-teams-intent.js';
import { chatOutcome } from './chat-outcome.js';
import { asksForCategoryCatalog } from './list-categories-intent.js';
import { resolvePendingCategoryPick } from './resolve-pending-category.js';
import { runChat } from './run-chat.js';

function replacesPendingClarification(text: string): boolean {
  return asksForCategoryTeams(text) || asksForCategoryCatalog(text);
}

export async function resolveUserMessage(options: {
  callTool: CallTool;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  pending: PendingClarification | null;
  userMessage: string;
}): Promise<ChatOutcome> {
  const pending = options.pending;
  let userMessage = options.userMessage;

  if (pending && !replacesPendingClarification(userMessage)) {
    if (pending.kind === 'gender') {
      if (!inferGenderFromText(userMessage)) {
        return chatOutcome(
          contentChunks(ASK_GENDER_MESSAGE),
          pending,
        );
      }

      userMessage = `${pending.originalQuestion} ${userMessage}`;
    } else {
      const resolved = await resolvePendingCategoryPick({
        callTool: options.callTool,
        pending,
        userReply: userMessage,
      });

      if (resolved) {
        return resolved;
      }
    }
  }

  return runChat({
    callTool: options.callTool,
    tools: options.tools,
    history: options.history,
    userMessage,
  });
}
