import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from './chat-outcome.js';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { contentChunks } from '../content-chunks.js';
import { chatOutcome } from './chat-outcome.js';
import { asksForCategoryCatalog } from './list-categories-intent.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';
import { withFollowUpSuggestions } from './with-follow-up-suggestions.js';

const SEARCH_CATEGORIES_LIMIT = 50;

export async function fetchCategoryCatalogIfNeeded(options: {
  callTool: CallTool;
  userMessage: string;
}): Promise<ChatOutcome | null> {
  if (!asksForCategoryCatalog(options.userMessage)) {
    return null;
  }

  const categoryFilter = normalizeCategoryQuery(options.userMessage);
  const toolText = categoryFilter
    ? await options.callTool('search_categories', {
        query: categoryFilter,
        limit: SEARCH_CATEGORIES_LIMIT,
      })
    : await options.callTool('list_categories');

  return withFollowUpSuggestions(
    chatOutcome(contentChunks(formatToolResultFallback([toolText]))),
    {
      toolResults: [toolText],
      userMessage: options.userMessage,
    },
  );
}
