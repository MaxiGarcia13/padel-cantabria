import type { ChatTurnResult } from '../chat-turn-result';
import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
  ChatCompletionTool,
} from '@/utils/chat-completion-types';
import type { McpBrowserClient } from '@/utils/mcp';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '@/utils/chat-message-helpers';
import {
  mergeGenderFollowUp,
  needsGenderClarification,
} from '../category-teams-intent';
import { categoryTeamsTurnResult } from '../category-teams-reply-text';
import { AFTER_TOOLS_NUDGE, USER_GUIDANCE } from '../chat-prompts';
import { chatTurnResult } from '../chat-turn-result';
import {
  executeToolCalls,
  toolCallsIncludeListTeams,
} from '../execute-tool-calls';
import { fetchCategoryCatalogIfNeeded } from '../fetch-list-categories';
import {
  ensureCategoryTeamsReply,
  injectCategoryTeamsFollowUp,
} from '../resolve-category-teams-reply';
import { formatToolResultFallback } from '../tool-result-fallback';
import { askGenderResult } from './ask-gender-result';
import { clarificationFromToolResults } from './clarification-from-tool-results';
import { finalizeModelTextAnswer } from './finalize-model-text-answer';

const MAX_TOOL_ROUNDS = 3;

export async function runChatTurn(options: {
  client: ChatCompletionsClient;
  mcp: McpBrowserClient;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  userMessage: string;
}): Promise<ChatTurnResult> {
  const userMessage = mergeGenderFollowUp(
    options.userMessage,
    previousUserMessages(options.history),
  );

  const catalog = await fetchCategoryCatalogIfNeeded({
    mcp: options.mcp,
    userMessage,
  });
  if (catalog) {
    return catalog;
  }

  if (needsGenderClarification(userMessage)) {
    return askGenderResult(userMessage);
  }

  const messages: ChatCompletionMessageParam[] = [
    ...withoutSystemMessages(options.history),
    {
      role: 'user',
      content: `${USER_GUIDANCE}\n\nQuestion: ${userMessage}`,
    },
  ];
  const toolResults: string[] = [];

  for (let round = 0; round < MAX_TOOL_ROUNDS; round += 1) {
    const forceTextAnswer = round === MAX_TOOL_ROUNDS - 1;

    // Last round with tool data: summarize/fallback — free-form often pastes fake tool XML.
    if (forceTextAnswer && toolResults.length > 0) {
      return chatTurnResult(
        await finalizeModelTextAnswer({
          client: options.client,
          mcp: options.mcp,
          userMessage,
          messages,
          toolResults,
          content: null,
        }),
      );
    }

    const completion = await options.client.create({
      messages: withoutSystemMessages(messages),
      ...(forceTextAnswer
        ? { tool_choice: 'none' as const }
        : { tools: options.tools, tool_choice: 'auto' as const }),
    });

    const message = completion.choices[0]?.message;

    if (!message) {
      const chained = categoryTeamsTurnResult(
        await ensureCategoryTeamsReply({
          mcp: options.mcp,
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

    const toolCalls = forceTextAnswer ? [] : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      return chatTurnResult(
        await finalizeModelTextAnswer({
          client: options.client,
          mcp: options.mcp,
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
      mcp: options.mcp,
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

    const followUp = await injectCategoryTeamsFollowUp({
      mcp: options.mcp,
      userMessage,
      toolResults,
    });

    if (followUp === 'ask-gender') {
      return askGenderResult(userMessage);
    }

    if (typeof followUp === 'object' && 'clarify' in followUp) {
      return chatTurnResult(followUp.clarify, followUp.pending);
    }

    if (followUp === 'injected') {
      // Deterministic list beats another model round that may ignore tools.
      return chatTurnResult(formatToolResultFallback(toolResults));
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
  }

  const chained = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      mcp: options.mcp,
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
