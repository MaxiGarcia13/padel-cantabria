import type { FastifyInstance } from 'fastify';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import fastifyStatic from '@fastify/static';

const CHAT_DIST = resolve(import.meta.dirname, '../dist/chat');

export async function registerChatStatic(app: FastifyInstance): Promise<boolean> {
  if (!existsSync(CHAT_DIST)) {
    app.log.warn(
      `Chat UI not built (${CHAT_DIST}). Run pnpm --filter @padel-cantabria/assistant build:chat`,
    );
    return false;
  }

  await app.register(fastifyStatic, {
    root: CHAT_DIST,
    prefix: '/',
  });

  app.setNotFoundHandler((request, reply) => {
    const path = request.url.split('?')[0] ?? '';
    const isApiPath
      = path === '/health'
        || path.startsWith('/mcp')
        || path.startsWith('/categories')
        || path.startsWith('/phases')
        || path.startsWith('/teams')
        || path.startsWith('/players');

    if (request.method === 'GET' && !isApiPath) {
      return reply.sendFile('index.html');
    }

    return reply.status(404).send({ error: 'Not found' });
  });

  return true;
}
