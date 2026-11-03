import type { CallTool } from '@chat/call-tool.js';
import type { PendingCategoryClarification } from './clarification.js';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,
} from './clarification.js';
import { resolveListTeamsArgs } from './resolve-list-teams-args.js';

export type FetchCategoryTeamsResult
  = | { status: 'teams'; toolText: string }
    | {
      status: 'clarify';
      message: string;
      pending: PendingCategoryClarification;
    }
    | { status: 'skip' };

export async function fetchCategoryTeams(
  callTool: CallTool,
  userMessage: string,
): Promise<FetchCategoryTeamsResult> {
  const args = resolveListTeamsArgs(userMessage);
  if (!args) {
    return { status: 'skip' };
  }

  const toolText = await callTool('list_teams', {
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
        originalQuestion: userMessage,
        gender: args.gender,
      },
    };
  }

  return { status: 'teams', toolText };
}
