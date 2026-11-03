import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
  ChatCompletionTool,
} from '@chat/utils/chat-completion-types.js';
import { streamChat } from '@chat/complete-chat.js';
import { contentChunks } from '@chat/content-chunks.js';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '@chat/utils/chat-message-helpers.js';
import { looksLikeToolCallLeak } from '@chat/utils/looks-like-tool-call-leak.js';
import { askGenderResult } from './ask-gender-result.js';
import {
  mergeGenderFollowUp,
  needsGenderClarification,
} from './category-teams-intent.js';
import { categoryTeamsResult } from './category-teams-reply-text.js';
import { chatOutcome } from './chat-outcome.js';
import {
  AFTER_TOOLS_NUDGE,
  SUMMARIZE_TOOL_NUDGE,
  USER_GUIDANCE,
} from './chat-prompts.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';
import {
  executeToolCalls,
  toolCallsIncludeListTeams,
} from './execute-tool-calls.js';
import { fetchCategoryCatalogIfNeeded } from './fetch-list-categories.js';
import { resolveCategoryTeamsReply } from './resolve-category-teams-reply.js';
import { resolveDeterministicTextAnswer } from './resolve-deterministic-text-answer.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

const MAX_TOOL_ROUNDS = 3;

async function streamTextAnswer(
  messages: ChatCompletionMessageParam[],
): Promise<ChatOutcome> {
  const chunks = await streamChat({
    messages,
    tool_choice: 'none',
  });
  return chatOutcome(chunks);
}

async function finishTextAnswer(options: {
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
    return chatOutcome(
      contentChunks(deterministic.text),
      deterministic.pending,
    );
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

export async function runChat(options: {
  client: ChatCompletionsClient;
  callTool: CallTool;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  userMessage: string;
}): Promise<ChatOutcome> {
  const userMessage = mergeGenderFollowUp(
    options.userMessage,
    previousUserMessages(options.history),
  );

  const catalog = await fetchCategoryCatalogIfNeeded({
    callTool: options.callTool,
    userMessage,
  });
  if (catalog) {
    return chatOutcome(contentChunks(catalog.text), catalog.pending);
  }

  if (needsGenderClarification(userMessage)) {
    const asked = askGenderResult(userMessage);
    return chatOutcome(contentChunks(asked.text), asked.pending);
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: USER_GUIDANCE },
    ...withoutSystemMessages(options.history),
    { role: 'user', content: userMessage },
  ];
  const toolResults: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const forceTextAnswer = round === MAX_TOOL_ROUNDS - 1;

    if (forceTextAnswer && toolResults.length > 0) {
      return finishTextAnswer({
        callTool: options.callTool,
        userMessage,
        messages,
        toolResults,
        content: null,
      });
    }

    const completion = await options.client.create({
      messages,
      ...(forceTextAnswer
        ? { tool_choice: 'none' as const }
        : { tools: options.tools, tool_choice: 'auto' as const }),
    });

    const message = completion.choices[0]?.message;

    if (!message) {
      const chained = categoryTeamsResult(
        await resolveCategoryTeamsReply({
          callTool: options.callTool,
          userMessage,
          toolResults,
        }),
        userMessage,
      );
      if (chained) {
        return chatOutcome(contentChunks(chained.text), chained.pending);
      }

      const clarified = clarificationFromToolResults(toolResults, userMessage);
      if (clarified) {
        return chatOutcome(contentChunks(clarified.text), clarified.pending);
      }

      if (toolResults.length > 0) {
        return chatOutcome(
          contentChunks(formatToolResultFallback(toolResults)),
        );
      }
      return chatOutcome(contentChunks('No he podido generar una respuesta.'));
    }

    const toolCalls = forceTextAnswer
      ? []
      : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      return finishTextAnswer({
        callTool: options.callTool,
        userMessage,
        messages,
        toolResults,
        content: message.content?.trim() || null,
      });
    }

    if (
      toolCallsIncludeListTeams(toolCalls)
      && needsGenderClarification(userMessage)
    ) {
      const asked = askGenderResult(userMessage);
      return chatOutcome(contentChunks(asked.text), asked.pending);
    }

    messages.push({
      role: 'assistant',
      content: message.content ?? '',
      tool_calls: toolCalls,
    });

    await executeToolCalls({
      callTool: options.callTool,
      toolCalls,
      messages,
      toolResults,
    });

    const clarifiedAfterTools = clarificationFromToolResults(
      toolResults,
      userMessage,
    );
    if (clarifiedAfterTools) {
      return chatOutcome(
        contentChunks(clarifiedAfterTools.text),
        clarifiedAfterTools.pending,
      );
    }

    const followUp = categoryTeamsResult(
      await resolveCategoryTeamsReply({
        callTool: options.callTool,
        userMessage,
        toolResults,
      }),
      userMessage,
    );
    if (followUp) {
      return chatOutcome(contentChunks(followUp.text), followUp.pending);
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
  }

  const chained = categoryTeamsResult(
    await resolveCategoryTeamsReply({
      callTool: options.callTool,
      userMessage,
      toolResults,
    }),
    userMessage,
  );
  if (chained) {
    return chatOutcome(contentChunks(chained.text), chained.pending);
  }

  const clarified = clarificationFromToolResults(toolResults, userMessage);
  if (clarified) {
    return chatOutcome(contentChunks(clarified.text), clarified.pending);
  }

  if (toolResults.length > 0) {
    return finishTextAnswer({
      callTool: options.callTool,
      userMessage,
      messages,
      toolResults,
      content: null,
    });
  }

  return chatOutcome(
    contentChunks(
      'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.',
    ),
  );
}
