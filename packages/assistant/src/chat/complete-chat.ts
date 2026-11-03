import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type {
  ChatCompletion,
  ChatCompletionChunk,
  ChatCompletionCreateParams,
  ChatCompletionsClient,
} from './utils/chat-completion-types.js';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import { createAiRouter } from '../create-ai-router.js';

export type { ChatCompletionChunk };

type RouterMessages = Parameters<AiRouterInterface['create']>[0];

function getRouter(): AiRouterInterface {
  const router = createAiRouter();
  if (!router) {
    throw new Error(
      'No AI provider configured. Set GEMINI_API_KEY.',
    );
  }
  return router;
}

function rethrowProviderErrors(error: unknown): never {
  if (isAiErrorArray(error)) {
    const detail = error
      .map((item) => {
        const name = item.providerName ?? 'unknown';
        return item.message
          ? `${name}: ${item.message}`
          : name;
      })
      .join('; ');
    throw new Error(`All AI providers failed: ${detail}`);
  }
  throw error;
}

export async function completeChat(
  params: ChatCompletionCreateParams,
): Promise<ChatCompletion> {
  const router = getRouter();

  try {
    return await router.create(params.messages as RouterMessages, {
      stream: false,
      tools: params.tools,
      tool_choice: params.tool_choice,
    }) as ChatCompletion;
  } catch (error) {
    rethrowProviderErrors(error);
  }
}

export async function streamChat(
  params: ChatCompletionCreateParams,
): Promise<AsyncIterable<ChatCompletionChunk>> {
  const router = getRouter();

  try {
    return await router.create(params.messages as RouterMessages, {
      stream: true,
      tools: params.tools,
      tool_choice: params.tool_choice,
    }) as AsyncIterable<ChatCompletionChunk>;
  } catch (error) {
    rethrowProviderErrors(error);
  }
}

export const chatCompletionsClient: ChatCompletionsClient = {
  create: completeChat,
};
