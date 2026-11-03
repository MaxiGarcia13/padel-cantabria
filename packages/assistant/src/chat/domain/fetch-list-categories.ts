import type { CallTool } from '@chat/call-tool.js';
import type { ChatTurnResult } from './chat-turn-result.js';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { chatTurnResult } from './chat-turn-result.js';
import { formatCategorySearchResults } from './format-category-search.js';
import { formatLeagueCategories } from './format-league-categories.js';
import { asksForCategoryCatalog } from './list-categories-intent.js';

const SEARCH_CATEGORIES_LIMIT = 50;

export async function fetchCategoryCatalogIfNeeded(options: {
  callTool: CallTool;
  userMessage: string;
}): Promise<ChatTurnResult | null> {
  if (!asksForCategoryCatalog(options.userMessage)) {
    return null;
  }

  const categoryFilter = normalizeCategoryQuery(options.userMessage);
  if (!categoryFilter) {
    const toolText = await options.callTool('list_categories');
    return chatTurnResult(formatLeagueCategories(toolText));
  }

  const toolText = await options.callTool('search_categories', {
    query: categoryFilter,
    limit: SEARCH_CATEGORIES_LIMIT,
  });
  return chatTurnResult(formatCategorySearchResults(toolText));
}
