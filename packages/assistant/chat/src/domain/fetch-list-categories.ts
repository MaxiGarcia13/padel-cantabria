import type { McpBrowserClient } from '../utils/mcp-client';
import type { ChatTurnResult } from './chat-turn-result';
import { chatTurnResult } from './chat-turn-result';
import { formatLeagueCategories } from './format-league-categories';
import { asksForCategoryCatalog } from './list-categories-intent';

/**
 * Deterministic path: list the full category catalog via list_categories.
 */
export async function fetchCategoryCatalogIfNeeded(options: {
  mcp: McpBrowserClient;
  userMessage: string;
}): Promise<ChatTurnResult | null> {
  if (!asksForCategoryCatalog(options.userMessage)) {
    return null;
  }

  const toolText = await options.mcp.callTool('list_categories');
  return chatTurnResult(formatLeagueCategories(toolText));
}
