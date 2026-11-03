import type { AiRouterInterface } from '@maxigarcia/ai-router';
import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import type { PendingClarification } from '../chat/domain/clarification.js';
import type { ChatCompletionMessageParam } from '../chat/utils/chat-completion-types.js';
import type { AiRouterRequestOptions } from '../create-ai-router.js';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import { runChatTurnRequest } from '../chat/run-chat-turn-request.js';
import { badRequest, HttpError } from '../errors.js';

interface ChatCompletionsBody {
  messages?: unknown;
  tools?: unknown;
  tool_choice?: unknown;
}

interface ChatTurnBody {
  userMessage?: unknown;
  history?: unknown;
  pending?: unknown;
}

function isMessageArray(value: unknown): value is unknown[] {
  return Array.isArray(value) && value.length > 0;
}

function isHistoryMessage(
  value: unknown,
): value is Extract<ChatCompletionMessageParam, { role: 'user' | 'assistant' }> {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const message = value as { role?: unknown; content?: unknown };
  return (
    (message.role === 'user' || message.role === 'assistant')
    && typeof message.content === 'string'
  );
}

export function createChatRoutes(
  db: McpDatabaseClient,
  createRouter: (
    requestOptions?: AiRouterRequestOptions,
  ) => AiRouterInterface | null,
): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: ChatTurnBody }>(
      '/chat/turn',
      async (request) => {
        const { userMessage, history, pending } = request.body ?? {};

        if (typeof userMessage !== 'string' || !userMessage.trim()) {
          throw badRequest('userMessage must be a non-empty string', {
            code: 'invalid_user_message',
          });
        }

        if (history !== undefined && !Array.isArray(history)) {
          throw badRequest('history must be an array', {
            code: 'invalid_history',
          });
        }

        const parsedHistory = (history ?? []).filter(isHistoryMessage);

        return runChatTurnRequest(db, {
          userMessage: userMessage.trim(),
          history: parsedHistory,
          pending: (pending ?? null) as PendingClarification | null,
        });
      },
    );

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
            'No AI provider configured. Set GEMINI_API_KEY.',
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
