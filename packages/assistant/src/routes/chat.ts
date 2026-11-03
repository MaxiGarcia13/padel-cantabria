import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type { FastifyPluginAsync } from 'fastify';
import type { AiRouterRequestOptions } from '../create-ai-router.js';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import { badRequest, HttpError } from '../errors.js';

interface ChatCompletionsBody {
  messages?: unknown;
  tools?: unknown;
  tool_choice?: unknown;
}

function isMessageArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

export function createChatRoutes(
  createRouter: (
    requestOptions?: AiRouterRequestOptions,
  ) => AiRouterInterface | null,
): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: ChatCompletionsBody }>(
      '/chat/completions',
      async (request, reply) => {
        const { messages, tools, tool_choice: toolChoice } = request.body ?? {};

        if (!isMessageArray(messages)) {
          throw badRequest('messages must be a non-empty array', {
            code: 'invalid_messages',
          });
        }

        const router = createRouter({
          tools,
          tool_choice: toolChoice,
        });

        if (!router) {
          throw new HttpError(
            503,
            'No AI provider configured. Set GEMINI_API_KEY, OPEN_ROUTER_API_KEY, or GROQ_API_KEY.',
            { code: 'ai_not_configured' },
          );
        }

        try {
          return await router.create(
            messages as Parameters<AiRouterInterface['create']>[0],
          );
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
