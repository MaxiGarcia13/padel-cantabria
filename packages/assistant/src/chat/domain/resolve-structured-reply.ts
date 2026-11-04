import type { CallTool } from '@chat/call-tool.js';
import type { ChatResult } from './chat-result.js';
import { categoryTeamsResult } from './category-teams-reply-text.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';
import { resolveCategoryTeamsReply } from './resolve-category-teams-reply.js';

export async function resolveStructuredReply(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<ChatResult | null> {
  const categoryTeams = categoryTeamsResult(
    await resolveCategoryTeamsReply({
      callTool: options.callTool,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (categoryTeams) {
    return categoryTeams;
  }

  return clarificationFromToolResults(
    options.toolResults,
    options.userMessage,
  );
}
