import type { CallTool } from '@chat/call-tool.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from '@chat/utils/chat-completion-types.js';
import { completeForcedText } from '@chat/utils/complete-forced-text.js';
import { categoryTeamsTurnResult } from './category-teams-reply-text.js';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts.js';
import { ensureCategoryTeamsReply } from './resolve-category-teams-reply.js';
import {
  formatToolResultFallback,
  tryFormatToolResultFallback,
} from './tool-result-fallback/index.js';

export async function resolveEmptyModelReply(options: {
  client: ChatCompletionsClient;
  callTool: CallTool;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<string> {
  const chained = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      callTool: options.callTool,
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

  const formatted = tryFormatToolResultFallback(options.toolResults);
  if (formatted) {
    return formatted;
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
