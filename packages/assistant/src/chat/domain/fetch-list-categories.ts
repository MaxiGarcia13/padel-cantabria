import type { CallTool } from '@chat/call-tool.js';
import type { ChatTurnResult } from './chat-turn-result.js';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { chatTurnResult } from './chat-turn-result.js';
import { asksForCategoryCatalog } from './list-categories-intent.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

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
    return chatTurnResult(formatToolResultFallback([toolText]));
  }

  const toolText = await options.callTool('search_categories', {
    query: categoryFilter,
    limit: SEARCH_CATEGORIES_LIMIT,
  });
  return chatTurnResult(formatToolResultFallback([toolText]));
}
