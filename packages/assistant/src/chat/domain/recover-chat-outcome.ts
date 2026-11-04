import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import { contentChunks } from '@chat/content-chunks.js';
import { chatOutcome, chatOutcomeFromResult } from './chat-outcome.js';
import { resolveDeterministicTextAnswer } from './resolve-deterministic-text-answer.js';
import { resolveStructuredReply } from './resolve-structured-reply.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

export async function tryStructuredFollowUp(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<ChatOutcome | null> {
  const followUp = await resolveStructuredReply(options);
  return followUp
    ? chatOutcomeFromResult(followUp)
    : null;
}

export async function recoverChatOutcome(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
  emptyMessage: string;
}): Promise<ChatOutcome> {
  const deterministic = await resolveDeterministicTextAnswer({
    callTool: options.callTool,
    userMessage: options.userMessage,
    toolResults: options.toolResults,
  });
  if (deterministic) {
    return chatOutcomeFromResult(deterministic);
  }

  if (options.toolResults.length > 0) {
    return chatOutcome(
      contentChunks(formatToolResultFallback(options.toolResults)),
    );
  }

  return chatOutcome(contentChunks(options.emptyMessage));
}
