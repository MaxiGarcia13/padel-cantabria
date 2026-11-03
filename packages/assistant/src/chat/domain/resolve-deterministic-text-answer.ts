import type { CallTool } from '@chat/call-tool.js';
import type { ChatResult } from './chat-result.js';
import { toolResultsIncludeTeams } from '@chat/utils/parse-tool-json.js';
import { asksForCategoryTeams } from './category-teams-intent.js';
import { categoryTeamsResult } from './category-teams-reply-text.js';
import { chatResult } from './chat-result.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';
import { resolveCategoryTeamsReply } from './resolve-category-teams-reply.js';
import {
  formatToolResultFallback,
  tryFormatToolResultFallback,
} from './tool-result-fallback/index.js';

export async function resolveDeterministicTextAnswer(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<ChatResult | null> {
  const ensured = categoryTeamsResult(
    await resolveCategoryTeamsReply({
      callTool: options.callTool,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (ensured) {
    return ensured;
  }

  const clarified = clarificationFromToolResults(
    options.toolResults,
    options.userMessage,
  );
  if (clarified) {
    return clarified;
  }

  if (
    asksForCategoryTeams(options.userMessage)
    && toolResultsIncludeTeams(options.toolResults)
  ) {
    return chatResult(formatToolResultFallback(options.toolResults));
  }

  const formatted = tryFormatToolResultFallback(options.toolResults);
  if (formatted) {
    return chatResult(formatted);
  }

  return null;
}
