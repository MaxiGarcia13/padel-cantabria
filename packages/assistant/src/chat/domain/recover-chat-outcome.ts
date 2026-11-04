import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import { contentChunks } from '@chat/content-chunks.js';
import { categoryTeamsResult } from './category-teams-reply-text.js';
import { chatOutcome, chatOutcomeFromResult } from './chat-outcome.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';
import { resolveCategoryTeamsReply } from './resolve-category-teams-reply.js';
import { resolveDeterministicTextAnswer } from './resolve-deterministic-text-answer.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

export async function tryStructuredFollowUp(options: {
  callTool: CallTool;
  userMessage: string;
  toolResults: string[];
}): Promise<ChatOutcome | null> {
  const followUp = categoryTeamsResult(
    await resolveCategoryTeamsReply({
      callTool: options.callTool,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (followUp) {
    return chatOutcomeFromResult(followUp);
  }

  const clarified = clarificationFromToolResults(
    options.toolResults,
    options.userMessage,
  );
  if (clarified) {
    return chatOutcomeFromResult(clarified);
  }

  return null;
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
