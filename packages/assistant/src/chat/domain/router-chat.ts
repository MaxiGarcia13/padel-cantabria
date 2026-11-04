import type {
  ChatCompletionMessageParam,
  ChatCompletionMessageToolCall,
  ChatCompletionTool,
} from '@chat/utils/chat-completion-types.js';
import type { AiRouterInterface, writeNdjsonStream } from '@maxigarcia/ai-router';
import { getAiRouter } from '@assistant/create-ai-router';

type RouterMessages = Parameters<AiRouterInterface['create']>[0];
type RouterTools = NonNullable<
  Parameters<AiRouterInterface['create']>[1]
>['tools'];
type NdjsonStream = Parameters<typeof writeNdjsonStream>[0];

interface ChatTurnCompletion {
  choices: Array<{
    message?: {
      content?: string | null;
      tool_calls?: unknown;
    };
  }>;
}

function asRouterMessages(
  messages: ChatCompletionMessageParam[],
): RouterMessages {
  return messages as RouterMessages;
}

function asRouterTools(tools: ChatCompletionTool[]): RouterTools {
  return tools as RouterTools;
}

export function toolCallsFromMessage(
  message: { tool_calls?: unknown },
): ChatCompletionMessageToolCall[] {
  if (!Array.isArray(message.tool_calls)) {
    return [];
  }

  return message.tool_calls as ChatCompletionMessageToolCall[];
}

export async function completeChatTurn(
  messages: ChatCompletionMessageParam[],
  options:
    | { tools: ChatCompletionTool[]; toolChoice: 'auto' }
    | { toolChoice: 'none' },
): Promise<ChatTurnCompletion> {
  const router = getAiRouter();

  if (options.toolChoice === 'none') {
    return router.create(asRouterMessages(messages), {
      stream: false,
      tool_choice: 'none',
    }) as Promise<ChatTurnCompletion>;
  }

  return router.create(asRouterMessages(messages), {
    stream: false,
    tools: asRouterTools(options.tools),
    tool_choice: 'auto',
  }) as Promise<ChatTurnCompletion>;
}

export async function streamChatText(
  messages: ChatCompletionMessageParam[],
): Promise<NdjsonStream> {
  return getAiRouter().create(asRouterMessages(messages), {
    stream: true,
    tool_choice: 'none',
  });
}
