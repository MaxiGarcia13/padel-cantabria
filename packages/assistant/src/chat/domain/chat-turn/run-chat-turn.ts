import type { CallTool } from '@chat/call-tool.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
  ChatCompletionTool,
} from '@chat/utils/chat-completion-types.js';
import type { ChatTurnResult } from '../chat-turn-result.js';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '@chat/utils/chat-message-helpers.js';
import {
  mergeGenderFollowUp,
  needsGenderClarification,
} from '../category-teams-intent.js';
import { categoryTeamsTurnResult } from '../category-teams-reply-text.js';
import { AFTER_TOOLS_NUDGE, USER_GUIDANCE } from '../chat-prompts.js';
import { chatTurnResult } from '../chat-turn-result.js';
import {
  executeToolCalls,
  toolCallsIncludeListTeams,
} from '../execute-tool-calls.js';
import { fetchCategoryCatalogIfNeeded } from '../fetch-list-categories.js';
import { resolveCategoryTeamsReply } from '../resolve-category-teams-reply.js';
import { formatToolResultFallback } from '../tool-result-fallback/index.js';
import { askGenderResult } from './ask-gender-result.js';
import { clarificationFromToolResults } from './clarification-from-tool-results.js';
import { finalizeModelTextAnswer } from './finalize-model-text-answer.js';

const MAX_TOOL_ROUNDS = 3;

export async function runChatTurn(options: {
  client: ChatCompletionsClient;
  callTool: CallTool;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  userMessage: string;
}): Promise<ChatTurnResult> {
  const userMessage = mergeGenderFollowUp(
    options.userMessage,
    previousUserMessages(options.history),
  );

  const catalog = await fetchCategoryCatalogIfNeeded({
    callTool: options.callTool,
    userMessage,
  });
  if (catalog) {
    return catalog;
  }

  if (needsGenderClarification(userMessage)) {
    return askGenderResult(userMessage);
  }

  const messages: ChatCompletionMessageParam[] = [
    { role: 'system', content: USER_GUIDANCE },
    ...withoutSystemMessages(options.history),
    { role: 'user', content: userMessage },
  ];
  const toolResults: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const forceTextAnswer = round === MAX_TOOL_ROUNDS - 1;

    // Last round with tool data: summarize/fallback — free-form often pastes fake tool XML.
    if (forceTextAnswer && toolResults.length > 0) {
      return chatTurnResult(
        await finalizeModelTextAnswer({
          client: options.client,
          callTool: options.callTool,
          userMessage,
          messages,
          toolResults,
          content: null,
        }),
      );
    }

    const completion = await options.client.create({
      messages,
      ...(forceTextAnswer
        ? { tool_choice: 'none' as const }
        : { tools: options.tools, tool_choice: 'auto' as const }),
    });

    const message = completion.choices[0]?.message;

    if (!message) {
      const chained = categoryTeamsTurnResult(
        await resolveCategoryTeamsReply({
          callTool: options.callTool,
          userMessage,
          toolResults,
        }),
        userMessage,
      );
      if (chained) {
        return chained;
      }

      const clarified = clarificationFromToolResults(toolResults, userMessage);
      if (clarified) {
        return clarified;
      }

      if (toolResults.length > 0) {
        return chatTurnResult(formatToolResultFallback(toolResults));
      }
      return chatTurnResult('No he podido generar una respuesta.');
    }

    const toolCalls = forceTextAnswer
      ? []
      : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      return chatTurnResult(
        await finalizeModelTextAnswer({
          client: options.client,
          callTool: options.callTool,
          userMessage,
          messages,
          toolResults,
          content: message.content?.trim() || null,
        }),
      );
    }

    if (
      toolCallsIncludeListTeams(toolCalls)
      && needsGenderClarification(userMessage)
    ) {
      return askGenderResult(userMessage);
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
      return clarifiedAfterTools;
    }

    const followUp = categoryTeamsTurnResult(
      await resolveCategoryTeamsReply({
        callTool: options.callTool,
        userMessage,
        toolResults,
      }),
      userMessage,
    );
    if (followUp) {
      // Deterministic list/clarification beats another model round.
      return followUp;
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
  }

  const chained = categoryTeamsTurnResult(
    await resolveCategoryTeamsReply({
      callTool: options.callTool,
      userMessage,
      toolResults,
    }),
    userMessage,
  );
  if (chained) {
    return chained;
  }

  const clarified = clarificationFromToolResults(toolResults, userMessage);
  if (clarified) {
    return clarified;
  }

  if (toolResults.length > 0) {
    return chatTurnResult(formatToolResultFallback(toolResults));
  }

  return chatTurnResult(
    'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.',
  );
}
