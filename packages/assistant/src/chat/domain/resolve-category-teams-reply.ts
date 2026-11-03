import type { CallTool } from '@chat/call-tool.js';
import type { PendingCategoryClarification } from './clarification.js';
import { toolResultsIncludeTeams } from '@chat/utils/parse-tool-json.js';
import {
  asksForCategoryTeams,
  needsGenderClarification,
} from './category-teams-intent.js';
import { fetchCategoryTeamsIfNeeded } from './fetch-category-teams.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

export type CategoryTeamsReply
  = | {
    status: 'text';
    text: string;
    pending?: PendingCategoryClarification;
  }
  | { status: 'ask-gender' }
  | { status: 'none' };

async function fetchCategoryTeamsOutcome(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<CategoryTeamsReply> {
  const fetched = await fetchCategoryTeamsIfNeeded(options);

  if (fetched.status === 'skip') {
    return { status: 'none' };
  }

  if (fetched.status === 'clarify') {
    return {
      status: 'text',
      text: fetched.message,
      pending: fetched.pending,
    };
  }

  options.toolResults.push(fetched.toolText);
  return {
    status: 'text',
    text: formatToolResultFallback([fetched.toolText]),
  };
}

export async function ensureCategoryTeamsReply(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<CategoryTeamsReply> {
  if (!asksForCategoryTeams(options.userMessage)) {
    return { status: 'none' };
  }

  if (toolResultsIncludeTeams(options.toolResults)) {
    return { status: 'none' };
  }

  if (needsGenderClarification(options.userMessage)) {
    return { status: 'ask-gender' };
  }

  return fetchCategoryTeamsOutcome(options);
}

export async function injectCategoryTeamsFollowUp(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<
  | 'ask-gender'
  | 'injected'
  | 'none'
  | { clarify: string; pending: PendingCategoryClarification }
> {
  if (!asksForCategoryTeams(options.userMessage)) {
    return 'none';
  }

  if (toolResultsIncludeTeams(options.toolResults)) {
    return 'none';
  }

  if (needsGenderClarification(options.userMessage)) {
    return 'ask-gender';
  }

  const fetched = await fetchCategoryTeamsIfNeeded(options);

  if (fetched.status === 'skip') {
    return 'none';
  }

  if (fetched.status === 'clarify') {
    return { clarify: fetched.message, pending: fetched.pending };
  }

  options.toolResults.push(fetched.toolText);
  return 'injected';
}
