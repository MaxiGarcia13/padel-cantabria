import type { McpBrowserClient } from '../utils/mcp';
import type { ChatTurnResult } from './chat-turn-result';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { chatTurnResult } from './chat-turn-result';
import { formatCategorySearchResults } from './format-category-search';
import { formatLeagueCategories } from './format-league-categories';
import { asksForCategoryCatalog } from './list-categories-intent';

const SEARCH_CATEGORIES_LIMIT = 50;

export async function fetchCategoryCatalogIfNeeded(options: {
  mcp: McpBrowserClient;
  userMessage: string;
}): Promise<ChatTurnResult | null> {
  if (!asksForCategoryCatalog(options.userMessage)) {
    return null;
  }

  const categoryFilter = normalizeCategoryQuery(options.userMessage);
  if (!categoryFilter) {
    const toolText = await options.mcp.callTool('list_categories');
    return chatTurnResult(formatLeagueCategories(toolText));
  }

  const toolText = await options.mcp.callTool('search_categories', {
    query: categoryFilter,
    limit: SEARCH_CATEGORIES_LIMIT,
  });
  return chatTurnResult(formatCategorySearchResults(toolText));
}
