import type { McpBrowserClient } from '../utils/mcp';
import type { PendingCategoryClarification } from './clarification';
import { toolResultsIncludeTeams } from '../utils/parse-tool-json';
import { asksForCategoryTeams } from './category-teams-intent';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,

} from './clarification';
import { resolveListTeamsArgs } from './resolve-list-teams-args';

export type FetchCategoryTeamsResult
  = | { status: 'teams'; toolText: string }
    | {
      status: 'clarify';
      message: string;
      pending: PendingCategoryClarification;
    }
    | { status: 'skip' };

export async function fetchCategoryTeamsIfNeeded(options: {
  mcp: McpBrowserClient;
  userMessage: string;
  toolResults: string[];
}): Promise<FetchCategoryTeamsResult> {
  if (!asksForCategoryTeams(options.userMessage)) {
    return { status: 'skip' };
  }

  if (toolResultsIncludeTeams(options.toolResults)) {
    return { status: 'skip' };
  }

  const args = resolveListTeamsArgs(options.userMessage);

  if (!args) {
    return { status: 'skip' };
  }

  const toolText = await options.mcp.callTool('list_teams', {
    gender: args.gender,
    category: args.category,
  });

  const categoryError = parseCategoryToolError(toolText);
  if (categoryError) {
    const message
      = categoryError.code === 'unknown_category'
        && categoryError.candidates.length === 0
        ? formatUnknownCategoryMessage()
        : formatCategoryClarification(categoryError.candidates);

    return {
      status: 'clarify',
      message,
      pending: {
        kind: 'category',
        options: categoryError.candidates,
        originalQuestion: options.userMessage,
        gender: args.gender,
      },
    };
  }

  return { status: 'teams', toolText };
}
