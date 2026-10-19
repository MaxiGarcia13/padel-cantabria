import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { McpBrowserClient } from '../utils/mcp-client';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '../utils/chat-message-helpers';
import {
  ASK_GENDER_MESSAGE,
  mergeGenderFollowUp,
  needsGenderClarification,
} from './category-teams-intent';
import { categoryTeamsReplyText } from './category-teams-reply-text';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,
} from './clarification';
import { AFTER_TOOLS_NUDGE, USER_GUIDANCE } from './chat-prompts';
import {
  executeToolCalls,
  toolCallsIncludeListTeams,
} from './execute-tool-calls';
import {
  ensureCategoryTeamsReply,
  injectCategoryTeamsFollowUp,
} from './resolve-category-teams-reply';
import { resolveEmptyModelReply } from './resolve-empty-model-reply';
import { formatToolResultFallback } from './tool-result-fallback';

/** Enough for search → follow-up tool; last round forces a text answer. */
const MAX_TOOL_ROUNDS = 3;

function clarificationFromToolResults(toolResults: string[]): string | null {
  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const error = parseCategoryToolError(toolResults[index]!);
    if (!error) {
      continue;
    }

    if (error.code === 'unknown_category' && error.candidates.length === 0) {
      return formatUnknownCategoryMessage();
    }

    return formatCategoryClarification(error.candidates);
  }

  return null;
}

export async function runChatTurn(options: {
  engine: MLCEngineInterface;
  mcp: McpBrowserClient;
  tools: ChatCompletionTool[];
  history: ChatCompletionMessageParam[];
  userMessage: string;
}): Promise<string> {
  const userMessage = mergeGenderFollowUp(
    options.userMessage,
    previousUserMessages(options.history),
  );

  if (needsGenderClarification(userMessage)) {
    return ASK_GENDER_MESSAGE;
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
      const chainedText = categoryTeamsReplyText(
        await ensureCategoryTeamsReply({
          mcp: options.mcp,
          userMessage,
          toolResults,
        }),
      );
      if (chainedText) {
        return chainedText;
      }

      const clarified = clarificationFromToolResults(toolResults);
      if (clarified) {
        return clarified;
      }

      if (toolResults.length > 0) {
        return formatToolResultFallback(toolResults);
      }
      return 'No he podido generar una respuesta.';
    }

    const toolCalls = forceTextAnswer ? [] : (message.tool_calls ?? []);

    if (toolCalls.length === 0) {
      const ensuredText = categoryTeamsReplyText(
        await ensureCategoryTeamsReply({
          mcp: options.mcp,
          userMessage,
          toolResults,
        }),
      );
      if (ensuredText) {
        return ensuredText;
      }

      const clarified = clarificationFromToolResults(toolResults);
      if (clarified) {
        return clarified;
      }

      const content = message.content?.trim();
      if (content) {
        return content;
      }

      return resolveEmptyModelReply({
        engine: options.engine,
        mcp: options.mcp,
        userMessage,
        messages,
        toolResults,
      });
    }

    if (
      toolCallsIncludeListTeams(toolCalls)
      && needsGenderClarification(userMessage)
    ) {
      return ASK_GENDER_MESSAGE;
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

    const clarifiedAfterTools = clarificationFromToolResults(toolResults);
    if (clarifiedAfterTools) {
      return clarifiedAfterTools;
    }

    const followUp = await injectCategoryTeamsFollowUp({
      mcp: options.mcp,
      userMessage,
      toolResults,
      messages,
    });

    if (followUp === 'ask-gender') {
      return ASK_GENDER_MESSAGE;
    }

    if (typeof followUp === 'object' && 'clarify' in followUp) {
      return followUp.clarify;
    }

    if (followUp === 'injected') {
      continue;
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
  }

  const chainedText = categoryTeamsReplyText(
    await ensureCategoryTeamsReply({
      mcp: options.mcp,
      userMessage,
      toolResults,
    }),
  );
  if (chainedText) {
    return chainedText;
  }

  const clarified = clarificationFromToolResults(toolResults);
  if (clarified) {
    return clarified;
  }

  if (toolResults.length > 0) {
    return formatToolResultFallback(toolResults);
  }

  return 'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.';
}
