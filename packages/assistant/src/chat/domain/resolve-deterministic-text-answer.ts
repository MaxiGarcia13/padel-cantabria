import type { CallTool } from '@chat/call-tool.js';
import type { ChatResult } from './chat-result.js';
import { toolResultsIncludeTeams } from '@chat/utils/parse-tool-json.js';
import { asksForCategoryTeams } from './category-teams-intent.js';
import { chatResult } from './chat-result.js';
import { resolveStructuredReply } from './resolve-structured-reply.js';
import {
  formatToolResultFallback,
  tryFormatToolResultFallback,
} from './tool-result-fallback/index.js';

export async function resolveDeterministicTextAnswer(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<ChatResult | null> {
  const structured = await resolveStructuredReply(options);
  if (structured) {
    return structured;
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
