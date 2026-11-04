import type { McpDatabaseClient } from '@padel-cantabria/database';
import cors from '@fastify/cors';
import { isAiErrorArray } from '@maxigarcia/ai-utils';
import Fastify from 'fastify';
import { CHAT_SESSION_HEADER } from './chat/chat-session.js';
import { HttpError, httpErrorPayload } from './errors.js';
import { createCategoriesRoutes } from './routes/categories.js';
import { createChatRoutes } from './routes/chat.js';
import { createMcpRoutes } from './routes/mcp.js';
import { createPhasesRoutes } from './routes/phases.js';
import { createPlayersRoutes } from './routes/players.js';
import { createTeamsRoutes } from './routes/teams.js';
import { registerChatStatic } from './static-chat.js';

export async function createApp(db: McpDatabaseClient) {
  const app = Fastify({ logger: true });

  await app.register(cors, {
    origin: true,
    allowedHeaders: [
      'Content-Type',
      'Accept',
      CHAT_SESSION_HEADER,
      'mcp-session-id',
    ],
  });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send(httpErrorPayload(error));
    }

    if (isAiErrorArray(error)) {
      app.log.error(error);
      return reply.status(502).send({
        error: 'All providers failed',
        providers: error.map((item) => ({
          providerName: item.providerName,
          status: item.status,
          message: item.message,
        })),
      });
    }

    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(createCategoriesRoutes(db));
  await app.register(createPhasesRoutes(db));
  await app.register(createTeamsRoutes(db));
  await app.register(createPlayersRoutes(db));
  await app.register(createChatRoutes(db));
  await app.register(createMcpRoutes(db));
  await registerChatStatic(app);

  return app;
}
