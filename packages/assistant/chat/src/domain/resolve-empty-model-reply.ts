import type {
  ChatCompletionMessageParam,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { McpBrowserClient } from '../utils/mcp-client';
import { completeForcedText } from '../utils/complete-forced-text';
import { categoryTeamsReplyText } from './category-teams-reply-text';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts';
import { ensureCategoryTeamsReply } from './resolve-category-teams-reply';
import { formatToolResultFallback } from './tool-result-fallback';

export async function resolveEmptyModelReply(options: {
  engine: MLCEngineInterface;
  mcp: McpBrowserClient;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<string> {
  const chained = await ensureCategoryTeamsReply({
    mcp: options.mcp,
    userMessage: options.userMessage,
    toolResults: options.toolResults,
  });
  const chainedText = categoryTeamsReplyText(chained);
  if (chainedText) {
    return chainedText;
  }

  if (options.toolResults.length === 0) {
    return 'No he encontrado una respuesta.';
  }

  const summarizeMessages: ChatCompletionMessageParam[] = [
    ...options.messages,
    { role: 'user', content: SUMMARIZE_TOOL_NUDGE },
  ];

  const summarized = await completeForcedText(
    options.engine,
    summarizeMessages,
  );

  if (summarized) {
    return summarized;
  }

  return formatToolResultFallback(options.toolResults);
}
