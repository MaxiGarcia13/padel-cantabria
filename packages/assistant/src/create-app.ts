import type { DatabaseClient } from '@padel-cantabria/database';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { createAiRouter } from './create-ai-router.js';
import { HttpError, httpErrorPayload } from './errors.js';
import { createCategoriesRoutes } from './routes/categories.js';
import { createChatRoutes } from './routes/chat.js';
import { createMcpRoutes } from './routes/mcp.js';
import { createPhasesRoutes } from './routes/phases.js';
import { createPlayersRoutes } from './routes/players.js';
import { createTeamsRoutes } from './routes/teams.js';
import { registerChatStatic } from './static-chat.js';

export async function createApp(db: DatabaseClient) {
  const app = Fastify({ logger: true });
  const aiRouter = createAiRouter();

  await app.register(cors, { origin: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send(httpErrorPayload(error));
    }

    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(createCategoriesRoutes(db));
  await app.register(createPhasesRoutes(db));
  await app.register(createTeamsRoutes(db));
  await app.register(createPlayersRoutes(db));
  await app.register(createChatRoutes(aiRouter));
  await app.register(createMcpRoutes(db));
  await registerChatStatic(app);

  return app;
}
