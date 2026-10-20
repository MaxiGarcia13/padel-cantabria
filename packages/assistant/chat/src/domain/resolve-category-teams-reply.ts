import type { McpBrowserClient } from '../utils/mcp';
import type { PendingCategoryClarification } from './clarification';
import { toolResultsIncludeTeams } from '../utils/parse-tool-json';
import {
  asksForCategoryTeams,
  needsGenderClarification,
} from './category-teams-intent';
import { fetchCategoryTeamsIfNeeded } from './fetch-category-teams';
import { formatToolResultFallback } from './tool-result-fallback';

export type CategoryTeamsReply
  = | {
    status: 'text';
    text: string;
    pending?: PendingCategoryClarification;
  }
  | { status: 'ask-gender' }
  | { status: 'none' };

async function fetchCategoryTeamsOutcome(options: {
  mcp: McpBrowserClient;
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
  mcp: McpBrowserClient;
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
  mcp: McpBrowserClient;
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
