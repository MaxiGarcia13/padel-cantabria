import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
} from '@chat/utils/chat-completion-types.js';
import { completeForcedText } from '@chat/utils/complete-forced-text.js';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts.js';
import {
  formatToolResultFallback,
  tryFormatToolResultFallback,
} from './tool-result-fallback/index.js';

export async function resolveEmptyModelReply(options: {
  client: ChatCompletionsClient;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
}): Promise<string> {
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
