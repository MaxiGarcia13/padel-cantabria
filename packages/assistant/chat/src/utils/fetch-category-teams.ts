import { asksForCategoryTeams } from './category-teams-intent';
import type { McpBrowserClient } from './mcp-client';
import { toolResultsIncludeTeams } from './parse-tool-json';
import { resolveListTeamsArgs } from './resolve-list-teams-args';

/**
 * When the user asked for teams in a category but tools never returned `teams[]`,
 * call `list_teams` with args resolved from prior results and/or the question.
 */
export async function fetchCategoryTeamsIfNeeded(options: {
  mcp: McpBrowserClient;
  userMessage: string;
  toolResults: string[];
}): Promise<string | null> {
  if (!asksForCategoryTeams(options.userMessage)) {
    return null;
  }

  if (toolResultsIncludeTeams(options.toolResults)) {
    return null;
  }

  const args = resolveListTeamsArgs(
    options.toolResults,
    options.userMessage,
  );

  if (!args) {
    return null;
  }

  return options.mcp.callTool('list_teams', {
    gender: args.gender,
    category: args.category,
    ...(args.phase ? { phase: args.phase } : {}),
  });
}
