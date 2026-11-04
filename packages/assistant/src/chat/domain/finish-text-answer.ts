import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import type { ChatCompletionMessageParam } from '@chat/utils/chat-completion-types.js';
import { contentChunks } from '@chat/content-chunks.js';
import { looksLikeToolCallLeak } from '@chat/utils/looks-like-tool-call-leak.js';
import { chatOutcome, chatOutcomeFromResult } from './chat-outcome.js';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts.js';
import { resolveDeterministicTextAnswer } from './resolve-deterministic-text-answer.js';
import { streamChatText } from './router-chat.js';

export async function streamTextAnswer(
  messages: ChatCompletionMessageParam[],
): Promise<ChatOutcome> {
  return chatOutcome(await streamChatText(messages));
}

export async function finishTextAnswer(options: {
  callTool: CallTool;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
  content: string | null;
}): Promise<ChatOutcome> {
  const deterministic = await resolveDeterministicTextAnswer({
    callTool: options.callTool,
    userMessage: options.userMessage,
    toolResults: options.toolResults,
  });
  if (deterministic) {
    return chatOutcomeFromResult(deterministic);
  }

  if (options.content && !looksLikeToolCallLeak(options.content)) {
    return chatOutcome(contentChunks(options.content));
  }

  if (options.toolResults.length === 0) {
    return chatOutcome(contentChunks('No he encontrado una respuesta.'));
  }

  return streamTextAnswer([
    ...options.messages,
    { role: 'user', content: SUMMARIZE_TOOL_NUDGE },
  ]);
}
