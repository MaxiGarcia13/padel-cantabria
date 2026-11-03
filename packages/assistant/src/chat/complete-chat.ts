import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionsClient,
} from './utils/chat-completion-types.js';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import { createAiRouter } from '../create-ai-router.js';

export interface ChatCompletionChunk {
  choices?: Array<{
    delta?: {
      content?: string | null;
      role?: string;
    };
    finish_reason?: string | null;
  }>;
}

function isChatCompletion(value: unknown): value is ChatCompletion {
  if (!value || typeof value !== 'object') {
    return false;
  }

  if (Symbol.asyncIterator in value) {
    return false;
  }

  return Array.isArray((value as { choices?: unknown }).choices);
}

function isAsyncIterable(
  value: unknown,
): value is AsyncIterable<ChatCompletionChunk> {
  return Boolean(
    value
    && typeof value === 'object'
    && Symbol.asyncIterator in value,
  );
}

async function createWithRouter(
  params: ChatCompletionCreateParams & { stream?: boolean },
): Promise<unknown> {
  const router = createAiRouter({
    tools: params.tools,
    tool_choice: params.tool_choice,
  });

  if (!router) {
    throw new Error(
      'No AI provider configured. Set GEMINI_API_KEY.',
    );
  }

  try {
    return await router.create(
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
}

export async function completeChat(
  params: ChatCompletionCreateParams,
): Promise<ChatCompletion> {
  const result = await createWithRouter(params);

  if (!isChatCompletion(result)) {
    throw new Error('Invalid chat completion response');
  }

  return result;
}

export async function streamChat(
  params: ChatCompletionCreateParams,
): Promise<AsyncIterable<ChatCompletionChunk>> {
  const result = await createWithRouter({
    ...params,
    stream: true,
  });

  if (!isAsyncIterable(result)) {
    throw new Error('Invalid chat completion stream');
  }

  return result;
}

export const chatCompletionsClient: ChatCompletionsClient = {
  create: completeChat,
};
