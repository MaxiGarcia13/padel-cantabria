import type { DatabaseClient } from './db.js';
import cors from '@fastify/cors';
import Fastify from 'fastify';
import { HttpError } from './errors.js';
import { createCategoriesRoutes } from './routes/categories.js';
import { createMcpRoutes } from './routes/mcp.js';
import { createPlayersRoutes } from './routes/players.js';
import { createTeamsRoutes } from './routes/teams.js';

export async function createApp(db: DatabaseClient) {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.setErrorHandler((error, _request, reply) => {
    if (error instanceof HttpError) {
      return reply.status(error.statusCode).send({ error: error.message });
    }

    app.log.error(error);
    return reply.status(500).send({ error: 'Internal server error' });
  });

  app.get('/health', async () => ({ ok: true }));

  await app.register(createCategoriesRoutes(db));
  await app.register(createTeamsRoutes(db));
  await app.register(createPlayersRoutes(db));
  await app.register(createMcpRoutes(db));

  return app;
}
