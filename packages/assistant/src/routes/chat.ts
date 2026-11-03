import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import type { PendingClarification } from '../chat/domain/clarification.js';
import type { ChatCompletionMessageParam } from '../chat/utils/chat-completion-types.js';
import { writeNdjsonStream } from '@maxigarcia/ai-router';
import { runChatRequest } from '../chat/run-chat-request.js';
import { badRequest } from '../errors.js';

interface ChatBody {
  userMessage?: unknown;
  history?: unknown;
  pending?: unknown;
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

export function createChatRoutes(db: McpDatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: ChatBody }>(
      '/chat',
      async (request, reply) => {
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
        const outcome = await runChatRequest(db, {
          userMessage: userMessage.trim(),
          history: parsedHistory,
          pending: (pending ?? null) as PendingClarification | null,
        });

        if (outcome.pending) {
          reply.header(
            'X-Chat-Pending',
            encodeURIComponent(JSON.stringify(outcome.pending)),
          );
        }

        return reply
          .header('Cache-Control', 'no-cache')
          .type('application/x-ndjson; charset=utf-8')
          .send(
            writeNdjsonStream(
              outcome.chunks as Parameters<typeof writeNdjsonStream>[0],
            ),
          );
      },
    );
  };
}
