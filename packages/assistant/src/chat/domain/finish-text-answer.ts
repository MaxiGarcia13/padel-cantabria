import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import type { ChatCompletionMessageParam } from '@chat/utils/chat-completion-types.js';
import { contentChunks } from '@chat/content-chunks.js';
import { looksLikeToolCallLeak } from '@chat/utils/looks-like-tool-call-leak.js';
import { chatOutcome, chatOutcomeFromResult } from './chat-outcome.js';
import { SUMMARIZE_TOOL_NUDGE } from './chat-prompts.js';
import { resolveDeterministicTextAnswer } from './resolve-deterministic-text-answer.js';
import { streamChatText } from './router-chat.js';
import { withFollowUpSuggestions } from './with-follow-up-suggestions.js';

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
  const scope = {
    toolResults: options.toolResults,
    userMessage: options.userMessage,
  };

  const deterministic = await resolveDeterministicTextAnswer({
    callTool: options.callTool,
    userMessage: options.userMessage,
    toolResults: options.toolResults,
  });
  if (deterministic) {
    return withFollowUpSuggestions(
      chatOutcomeFromResult(deterministic),
      scope,
    );
  }

  if (options.content && !looksLikeToolCallLeak(options.content)) {
    return withFollowUpSuggestions(
      chatOutcome(contentChunks(options.content)),
      scope,
    );
  }

  if (options.toolResults.length === 0) {
    return chatOutcome(contentChunks('No he encontrado una respuesta.'));
  }

  return withFollowUpSuggestions(
    await streamTextAnswer([
      ...options.messages,
      { role: 'user', content: SUMMARIZE_TOOL_NUDGE },
    ]),
    scope,
  );
}
