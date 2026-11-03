import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import type { PendingClarification } from '../chat/domain/clarification.js';
import type { ChatCompletionMessageParam } from '../chat/utils/chat-completion-types.js';
import { runChatTurnRequest } from '../chat/run-chat-turn-request.js';
import { badRequest } from '../errors.js';

interface ChatTurnBody {
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
    app.post<{ Body: ChatTurnBody }>(
      '/chat',
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
  };
}
