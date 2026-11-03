import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import { writeNdjsonStream } from '@maxigarcia/ai-router';
import { CHAT_SESSION_HEADER } from '../chat/chat-session.js';
import { parseChatMessages } from '../chat/parse-chat-messages.js';
import {
  getPendingForSession,
  setPendingForSession,
} from '../chat/pending-session-store.js';
import { runChatRequest } from '../chat/run-chat-request.js';
import { badRequest } from '../errors.js';

interface ChatBody {
  messages?: unknown;
}

export function createChatRoutes(db: McpDatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.post<{ Body: ChatBody }>(
      '/chat',
      async (request, reply) => {
        const sessionHeader = request.headers[CHAT_SESSION_HEADER];
        const sessionId = typeof sessionHeader === 'string'
          ? sessionHeader.trim()
          : '';

        if (!sessionId) {
          throw badRequest(`${CHAT_SESSION_HEADER} header is required`, {
            code: 'missing_chat_session',
          });
        }

        let parsed;
        try {
          parsed = parseChatMessages(request.body?.messages);
        } catch (error) {
          const message = error instanceof Error
            ? error.message
            : 'Invalid messages';
          throw badRequest(message, { code: 'invalid_messages' });
        }

        const outcome = await runChatRequest(db, {
          userMessage: parsed.userMessage,
          history: parsed.history,
          pending: getPendingForSession(sessionId),
        });

        setPendingForSession(sessionId, outcome.pending);

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
