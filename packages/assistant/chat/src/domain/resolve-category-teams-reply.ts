import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import type { McpBrowserClient } from '../utils/mcp-client';
import { formatToolResult } from '../utils/chat-message-helpers';
import { toolResultsIncludeTeams } from '../utils/parse-tool-json';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
  needsGenderClarification,
} from './category-teams-intent';
import type { PendingCategoryClarification } from './clarification';
import { AFTER_TOOLS_NUDGE } from './chat-prompts';
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

/**
 * Terminal path: ask for gender, clarify category, or return a teams list.
 */
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

/**
 * Mid-loop path: inject list_teams into the conversation for the model to summarize.
 * Category clarification ends the turn (returned as ask-gender-like terminal via status).
 */
export async function injectCategoryTeamsFollowUp(options: {
  mcp: McpBrowserClient;
  userMessage: string;
  toolResults: string[];
  messages: ChatCompletionMessageParam[];
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
  options.messages.push({
    role: 'user',
    content: `${formatToolResult('list_teams', fetched.toolText)}\n\n${AFTER_TOOLS_NUDGE}`,
  });

  return 'injected';
}
