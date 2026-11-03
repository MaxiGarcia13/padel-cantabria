import type { CallTool } from '@chat/call-tool.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from '@chat/utils/chat-completion-types.js';
import { looksLikeToolCallLeak } from '@chat/utils/looks-like-tool-call-leak.js';
import { toolResultsIncludeTeams } from '@chat/utils/parse-tool-json.js';
import { asksForCategoryTeams } from '../category-teams-intent.js';
import { categoryTeamsTurnResult } from '../category-teams-reply-text.js';
import { ensureCategoryTeamsReply } from '../resolve-category-teams-reply.js';
import { resolveEmptyModelReply } from '../resolve-empty-model-reply.js';
import { formatToolResultFallback } from '../tool-result-fallback/index.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';

export async function finalizeModelTextAnswer(options: {
  client: ChatCompletionsClient;
  callTool: CallTool;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
  content: string | null;
}): Promise<string> {
  const ensured = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      callTool: options.callTool,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (ensured) {
    return ensured.text;
  }

  const clarified = clarificationFromToolResults(
    options.toolResults,
    options.userMessage,
  );
  if (clarified) {
    return clarified.text;
  }

  // Prefer real teams[] over free-form prose (model often invents gender asks).
  if (
    asksForCategoryTeams(options.userMessage)
    && toolResultsIncludeTeams(options.toolResults)
  ) {
    return formatToolResultFallback(options.toolResults);
  }

  if (options.content && !looksLikeToolCallLeak(options.content)) {
    return options.content;
  }

  return resolveEmptyModelReply({
    client: options.client,
    callTool: options.callTool,
    userMessage: options.userMessage,
    messages: options.messages,
    toolResults: options.toolResults,
  });
}
