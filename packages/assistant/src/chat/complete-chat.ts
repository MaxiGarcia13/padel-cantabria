import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionsClient,
} from './utils/chat-completion-types.js';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import { createAiRouter } from '../create-ai-router.js';

function isChatCompletion(value: unknown): value is ChatCompletion {
  return Boolean(
    value
    && typeof value === 'object'
    && Array.isArray((value as { choices?: unknown }).choices),
  );
}

export async function completeChat(
  params: ChatCompletionCreateParams,
): Promise<ChatCompletion> {
  const router = createAiRouter({
    tools: params.tools,
    tool_choice: params.tool_choice,
  });

  if (!router) {
    throw new Error(
      'No AI provider configured. Set GEMINI_API_KEY.',
    );
  }

  let result: unknown;
  try {
    result = await router.create(
      params.messages as Parameters<AiRouterInterface['create']>[0],
    );
  } catch (error) {
    if (isAiErrorArray(error)) {
      const detail = error
        .map((item) => item.providerName ?? item.message)
        .join(', ');
      throw new Error(`All AI providers failed: ${detail}`);
    }
    throw error;
  }

  if (!isChatCompletion(result)) {
    throw new Error('Invalid chat completion response');
  }

  return result;
}

export const chatCompletionsClient: ChatCompletionsClient = {
  create: completeChat,
};
