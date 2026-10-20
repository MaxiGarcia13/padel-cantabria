import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
  ChatCompletionTool,
} from '../utils/chat-completion-types';
import type { McpBrowserClient } from '../utils/mcp-client';
import type { ChatTurnResult } from './chat-turn-result';
import type { PendingClarification } from './clarification';
import { inferGenderFromText } from '@padel-cantabria/shared';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
} from './category-teams-intent';
import { chatTurnResult } from './chat-turn-result';
import { asksForCategoryCatalog } from './list-categories-intent';
import { resolvePendingCategoryPick } from './resolve-pending-category';
import { runChatTurn } from './run-chat-turn';

function replacesPendingClarification(text: string): boolean {
  return asksForCategoryTeams(text) || asksForCategoryCatalog(text);
}

export async function resolveUserMessage(options: {
  client: ChatCompletionsClient;
  mcp: McpBrowserClient;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  pending: PendingClarification | null;
  userMessage: string;
}): Promise<ChatTurnResult> {
  const pending = options.pending;
  let userMessage = options.userMessage;

  if (pending && !replacesPendingClarification(userMessage)) {
    if (pending.kind === 'gender') {
      if (!inferGenderFromText(userMessage)) {
        return chatTurnResult(ASK_GENDER_MESSAGE, pending);
      }

      userMessage = `${pending.originalQuestion} ${userMessage}`;
    } else {
      const resolved = await resolvePendingCategoryPick({
        mcp: options.mcp,
        pending,
        userReply: userMessage,
      });

      if (resolved) {
        return resolved;
      }
    }
  }

  return runChatTurn({
    client: options.client,
    mcp: options.mcp,
    tools: options.tools,
    history: options.history,
    userMessage,
  });
}
