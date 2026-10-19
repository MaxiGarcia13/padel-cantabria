import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from '../utils/chat-completion-types';
import type { McpBrowserClient } from '../utils/mcp-client';
import { completeForcedText } from '../utils/complete-forced-text';
import { categoryTeamsTurnResult } from './category-teams-reply-text';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts';
import { ensureCategoryTeamsReply } from './resolve-category-teams-reply';
import { formatToolResultFallback } from './tool-result-fallback';

export async function resolveEmptyModelReply(options: {
  client: ChatCompletionsClient;
  mcp: McpBrowserClient;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<string> {
  const chained = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      mcp: options.mcp,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (chained) {
    return chained.text;
  }

  if (options.toolResults.length === 0) {
    return 'No he encontrado una respuesta.';
  }

  const summarizeMessages: ChatCompletionMessageParam[] = [
    ...options.messages,
    { role: 'user', content: SUMMARIZE_TOOL_NUDGE },
  ];

  const summarized = await completeForcedText(
    options.client,
    summarizeMessages,
  );

  if (summarized) {
    return summarized;
  }

  return formatToolResultFallback(options.toolResults);
}
