import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type { FastifyPluginAsync } from 'fastify';
import { badRequest, HttpError } from '../errors.js';

interface ChatCompletionsBody {
  messages?: unknown;
  tools?: unknown;
  tool_choice?: unknown;
}

function isMessageArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function isAiErrorArray(
  error: unknown,
): error is Array<{ message: string; status?: number; providerName?: string }> {
  return (
    Array.isArray(error)
    && error.length > 0
    && error.every(
      (item) =>
        item != null
        && typeof item === 'object'
        && 'message' in item
        && typeof (item as { message: unknown }).message === 'string',
    )
  );
}

export function createChatRoutes(
  router: AiRouterInterface | null,
): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: ChatCompletionsBody }>(
      '/chat/completions',
      async (request, reply) => {
        if (!router) {
          throw new HttpError(
            503,
            'No AI provider configured. Set GEMINI_API_KEY, OPEN_ROUTER_API_KEY, or GROQ_API_KEY.',
            { code: 'ai_not_configured' },
          );
        }

        const { messages, tools, tool_choice: toolChoice } = request.body ?? {};

        if (!isMessageArray(messages)) {
          throw badRequest('messages must be a non-empty array', {
            code: 'invalid_messages',
          });
        }

        try {
          // ai-router defaults to streaming; the chat tool loop needs a full completion.
          // Cast through unknown: package types only declare the streaming overload.
          const completion = await router.create(
            messages as Parameters<AiRouterInterface['create']>[0],
            {
              stream: false,
              ...(tools !== undefined ? { tools } : {}),
              ...(toolChoice !== undefined ? { tool_choice: toolChoice } : {}),
            } as unknown as Parameters<AiRouterInterface['create']>[1],
          );

          return completion;
        } catch (error) {
          if (isAiErrorArray(error)) {
            request.log.warn({ providers: error }, 'All AI providers failed');
            return reply.status(502).send({
              error: 'All AI providers failed',
              providers: error.map((item) => ({
                providerName: item.providerName,
                status: item.status,
                message: item.message,
              })),
            });
          }

          throw error;
        }
      },
    );
  };
}
