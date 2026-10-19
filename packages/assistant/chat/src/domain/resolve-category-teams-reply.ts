import type { ChatCompletionMessageParam } from '@mlc-ai/web-llm';
import type { McpBrowserClient } from '../utils/mcp-client';
import { formatToolResult } from '../utils/chat-message-helpers';
import { toolResultsIncludeTeams } from '../utils/parse-tool-json';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
  needsGenderClarification,
} from './category-teams-intent';
import { AFTER_TOOLS_NUDGE } from './chat-prompts';
import { fetchCategoryTeamsIfNeeded } from './fetch-category-teams';
import { formatToolResultFallback } from './tool-result-fallback';

async function fetchAndRecordCategoryTeams(options: {
  mcp: McpBrowserClient;
  userMessage: string;
  toolResults: string[];
}): Promise<string | null> {
  const teamsJson = await fetchCategoryTeamsIfNeeded(options);
  if (!teamsJson) {
    return null;
  }

  options.toolResults.push(teamsJson);
  return teamsJson;
}

/**
 * Terminal path: ask for gender, or return a deterministic teams list.
 */
export async function ensureCategoryTeamsReply(options: {
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

  if (needsGenderClarification(options.userMessage)) {
    return ASK_GENDER_MESSAGE;
  }

  const teamsJson = await fetchAndRecordCategoryTeams(options);
  if (!teamsJson) {
    return null;
  }

  return formatToolResultFallback([teamsJson]);
}

/**
 * Mid-loop path: inject list_teams into the conversation for the model to summarize.
 */
export async function injectCategoryTeamsFollowUp(options: {
  mcp: McpBrowserClient;
  userMessage: string;
  toolResults: string[];
  messages: ChatCompletionMessageParam[];
}): Promise<'ask-gender' | 'injected' | 'none'> {
  if (!asksForCategoryTeams(options.userMessage)) {
    return 'none';
  }

  if (toolResultsIncludeTeams(options.toolResults)) {
    return 'none';
  }

  if (needsGenderClarification(options.userMessage)) {
    return 'ask-gender';
  }

  const teamsJson = await fetchAndRecordCategoryTeams(options);
  if (!teamsJson) {
    return 'none';
  }

  options.messages.push({
    role: 'user',
    content: `${formatToolResult('list_teams', teamsJson)}\n\n${AFTER_TOOLS_NUDGE}`,
  });

  return 'injected';
}
