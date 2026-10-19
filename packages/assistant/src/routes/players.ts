import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseClient } from '../db.js';
import { getTopPlayersHandler } from '../handlers/get-top-players.js';
import { searchPlayersHandler } from '../handlers/search-players.js';
import { parseOptionalPositiveInt } from '../parse-query.js';

export function createPlayersRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get<{
      Querystring: {
        q?: string;
        league_id?: string;
        gender?: string;
        category?: string;
        limit?: string;
      };
    }>('/players/search', async (request) => {
      return searchPlayersHandler(db, {
        q: request.query.q,
        league_id: parseOptionalPositiveInt(request.query.league_id),
        gender: request.query.gender,
        category: request.query.category,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });

    app.get<{
      Querystring: {
        league_id?: string;
        gender?: string;
        category?: string;
        limit?: string;
      };
    }>('/players/top', async (request) => {
      return getTopPlayersHandler(db, {
        league_id: parseOptionalPositiveInt(request.query.league_id),
        gender: request.query.gender,
        category: request.query.category,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });
  };
}
