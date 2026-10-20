import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from '@/utils/chat-completion-types';
import type { McpBrowserClient } from '@/utils/mcp';
import { looksLikeToolCallLeak } from '@/utils/looks-like-tool-call-leak';
import { toolResultsIncludeTeams } from '@/utils/parse-tool-json';
import { asksForCategoryTeams } from '../category-teams-intent';
import { categoryTeamsTurnResult } from '../category-teams-reply-text';
import { ensureCategoryTeamsReply } from '../resolve-category-teams-reply';
import { resolveEmptyModelReply } from '../resolve-empty-model-reply';
import { formatToolResultFallback } from '../tool-result-fallback';
import { clarificationFromToolResults } from './clarification-from-tool-results';

export async function finalizeModelTextAnswer(options: {
  client: ChatCompletionsClient;
  mcp: McpBrowserClient;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
  content: string | null;
}): Promise<string> {
  const ensured = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      mcp: options.mcp,
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
    mcp: options.mcp,
    userMessage: options.userMessage,
    messages: options.messages,
    toolResults: options.toolResults,
  });
}
