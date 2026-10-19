import type {
  ChatCompletionMessageParam,
  ChatCompletionsClient,
  ChatCompletionTool,
} from '../utils/chat-completion-types';
import type { McpBrowserClient } from '../utils/mcp-client';
import type { ChatTurnResult } from './chat-turn-result';
import type { PendingCategoryClarification, PendingGenderClarification } from './clarification';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '../utils/chat-message-helpers';
import { looksLikeToolCallLeak } from '../utils/looks-like-tool-call-leak';
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

async function finalizeModelTextAnswer(options: {
  client: ChatCompletionsClient;
  mcp: McpBrowserClient;
  userMessage: string;
  messages: ChatCompletionMessageParam[];
  toolResults: string[];
  content: string | null;
}): Promise<string> {
  const ensured = categoryTeamsTurnResult(
    await ensureCategoryTeamsReply({
      mcp: options.mcp,
      userMessage: options.userMessage,
      toolResults: options.toolResults,
    }),
    options.userMessage,
  );
  if (ensured) {
    return ensured.text;
  }

  const clarified = clarificationFromToolResults(
    options.toolResults,
    options.userMessage,
  );
  if (clarified) {
    return clarified.text;
  }

  // Prefer real teams[] over free-form prose (model often invents gender asks).
  if (
    asksForCategoryTeams(options.userMessage)
    && toolResultsIncludeTeams(options.toolResults)
  ) {
    return formatToolResultFallback(options.toolResults);
  }

  if (options.content && !looksLikeToolCallLeak(options.content)) {
    return options.content;
  }

  return resolveEmptyModelReply({
    client: options.client,
    mcp: options.mcp,
    userMessage: options.userMessage,
    messages: options.messages,
    toolResults: options.toolResults,
  });
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
