import type { CallTool } from '@chat/call-tool.js';
import type { ChatOutcome } from '@chat/domain/chat-outcome.js';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from '@chat/utils/chat-completion-types.js';
import {
  previousUserMessages,
  withoutSystemMessages,
} from '@chat/utils/chat-message-helpers.js';
import { askGenderResult } from './ask-gender-result.js';
import {
  mergeGenderFollowUp,
  needsGenderClarification,
} from './category-teams-intent.js';
import { chatOutcomeFromResult } from './chat-outcome.js';
import { AFTER_TOOLS_NUDGE, USER_GUIDANCE } from './chat-prompts.js';
import { executeToolCalls } from './execute-tool-calls.js';
import { fetchCategoryCatalogIfNeeded } from './fetch-list-categories.js';
import { finishTextAnswer } from './finish-text-answer.js';
import {
  recoverChatOutcome,
  tryStructuredFollowUp,
} from './recover-chat-outcome.js';
import {
  completeChatTurn,
  toolCallsFromMessage,
} from './router-chat.js';

const MAX_TOOL_ROUNDS = 3;

export async function runChat(options: {
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
    return chatOutcomeFromResult(catalog);
  }

  if (needsGenderClarification(userMessage)) {
    return chatOutcomeFromResult(askGenderResult(userMessage));
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

    const completion = await completeChatTurn(
      messages,
      forceTextAnswer
        ? { toolChoice: 'none' }
        : { tools: options.tools, toolChoice: 'auto' },
    );

    const message = completion.choices[0]?.message;

    if (!message) {
      return recoverChatOutcome({
        callTool: options.callTool,
        userMessage,
        toolResults,
        emptyMessage: 'No he podido generar una respuesta.',
      });
    }

    const toolCalls = forceTextAnswer
      ? []
      : toolCallsFromMessage(message);

    if (toolCalls.length === 0) {
      const content = typeof message.content === 'string'
        ? message.content.trim()
        : '';
      return finishTextAnswer({
        callTool: options.callTool,
        userMessage,
        messages,
        toolResults,
        content: content || null,
      });
    }

    messages.push({
      role: 'assistant',
      content: typeof message.content === 'string'
        ? message.content
        : '',
      tool_calls: toolCalls,
    });

    await executeToolCalls({
      callTool: options.callTool,
      toolCalls,
      messages,
      toolResults,
    });

    const followUp = await tryStructuredFollowUp({
      callTool: options.callTool,
      userMessage,
      toolResults,
    });
    if (followUp) {
      return followUp;
    }

    messages.push({
      role: 'user',
      content: AFTER_TOOLS_NUDGE,
    });
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

  return recoverChatOutcome({
    callTool: options.callTool,
    userMessage,
    toolResults,
    emptyMessage:
      'He alcanzado el límite de herramientas para esta pregunta. Prueba a reformularla.',
  });
}
