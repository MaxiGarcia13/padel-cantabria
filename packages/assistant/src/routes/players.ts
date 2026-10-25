import type { McpDatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import { getTopPlayersHandler } from '../handlers/get-top-players.js';
import { searchPlayersHandler } from '../handlers/search-players.js';
import { parseOptionalPositiveInt } from '../parse-query.js';

export function createPlayersRoutes(db: McpDatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get<{
      Querystring: {
        q?: string;
        gender?: string;
        limit?: string;
      };
    }>('/players/search', async (request) => {
      return searchPlayersHandler(db, {
        q: request.query.q,
        gender: request.query.gender,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });

    app.get<{
      Querystring: {
        gender?: string;
        category?: string;
        limit?: string;
      };
    }>('/players/top', async (request) => {
      return getTopPlayersHandler(db, {
        gender: request.query.gender,
        category: request.query.category,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });
  };
}
