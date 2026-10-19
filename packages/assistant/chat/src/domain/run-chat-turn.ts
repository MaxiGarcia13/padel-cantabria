import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { McpBrowserClient } from '../utils/mcp-client';
import type { ChatTurnResult } from './chat-turn-result';
import type { PendingCategoryClarification, PendingGenderClarification } from './clarification';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '../utils/chat-message-helpers';
import { toolResultsIncludeTeams } from '../utils/parse-tool-json';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
  inferGenderFromText,
  mergeGenderFollowUp,
  needsGenderClarification,
} from './category-teams-intent';
import { categoryTeamsTurnResult } from './category-teams-reply-text';
import { AFTER_TOOLS_NUDGE, USER_GUIDANCE } from './chat-prompts';
import { chatTurnResult } from './chat-turn-result';
import { formatCategoryClarification, formatUnknownCategoryMessage, parseCategoryToolError } from './clarification';
import {
  executeToolCalls,
  toolCallsIncludeListTeams,
} from './execute-tool-calls';
import { fetchCategoryCatalogIfNeeded } from './fetch-list-categories';
import {
  ensureCategoryTeamsReply,
  injectCategoryTeamsFollowUp,
} from './resolve-category-teams-reply';
import { resolveEmptyModelReply } from './resolve-empty-model-reply';
import { formatToolResultFallback } from './tool-result-fallback';

/** Enough for search → follow-up tool; last round forces a text answer. */
const MAX_TOOL_ROUNDS = 3;

function askGenderResult(originalQuestion: string): ChatTurnResult {
  const pending: PendingGenderClarification = {
    kind: 'gender',
    originalQuestion,
  };
  return chatTurnResult(ASK_GENDER_MESSAGE, pending);
}

function clarificationFromToolResults(
  toolResults: string[],
  userMessage: string,
): ChatTurnResult | null {
  const gender = inferGenderFromText(userMessage);

  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const error = parseCategoryToolError(toolResults[index]!);
    if (!error) {
      continue;
    }

    if (error.code === 'unknown_category' && error.candidates.length === 0) {
      return chatTurnResult(formatUnknownCategoryMessage());
    }

    const text = formatCategoryClarification(error.candidates);
    if (!gender || error.candidates.length === 0) {
      return chatTurnResult(text);
    }

    const pending: PendingCategoryClarification = {
      kind: 'category',
      options: error.candidates,
      originalQuestion: userMessage,
      gender,
    };

    return chatTurnResult(text, pending);
  }

  return null;
}

export async function runChatTurn(options: {
  engine: MLCEngineInterface;
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

    // WebLLM mutates `request.messages` by unshifting its Hermes system prompt.
    // Pass a fresh copy without any system role so later tool rounds do not fail.
    const completion = await options.engine.chat.completions.create({
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
      const ensured = categoryTeamsTurnResult(
        await ensureCategoryTeamsReply({
          mcp: options.mcp,
          userMessage,
          toolResults,
        }),
        userMessage,
      );
      if (ensured) {
        return ensured;
      }

      const clarified = clarificationFromToolResults(toolResults, userMessage);
      if (clarified) {
        return clarified;
      }

      // Prefer real teams[] over Hermes prose (model often invents gender asks).
      if (
        asksForCategoryTeams(userMessage)
        && toolResultsIncludeTeams(toolResults)
      ) {
        return chatTurnResult(formatToolResultFallback(toolResults));
      }

      const content = message.content?.trim();
      if (content) {
        return chatTurnResult(content);
      }

      return chatTurnResult(
        await resolveEmptyModelReply({
          engine: options.engine,
          mcp: options.mcp,
          userMessage,
          messages,
          toolResults,
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
      // Hermes/WebLLM require string content even when only tool_calls are set.
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
      // Deterministic list beats another Hermes round that may ignore tools.
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
