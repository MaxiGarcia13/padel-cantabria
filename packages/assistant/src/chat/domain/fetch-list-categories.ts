import type { CallTool } from '@chat/call-tool.js';
import type { ChatResult } from './chat-result.js';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { chatResult } from './chat-result.js';
import { asksForCategoryCatalog } from './list-categories-intent.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

const SEARCH_CATEGORIES_LIMIT = 50;

export async function fetchCategoryCatalogIfNeeded(options: {
  callTool: CallTool;
  userMessage: string;
}): Promise<ChatResult | null> {
  if (!asksForCategoryCatalog(options.userMessage)) {
    return null;
  }

  const categoryFilter = normalizeCategoryQuery(options.userMessage);
  if (!categoryFilter) {
    const toolText = await options.callTool('list_categories');
    return chatResult(formatToolResultFallback([toolText]));
  }

  const toolText = await options.callTool('search_categories', {
    query: categoryFilter,
    limit: SEARCH_CATEGORIES_LIMIT,
  });
  return chatResult(formatToolResultFallback([toolText]));
}
