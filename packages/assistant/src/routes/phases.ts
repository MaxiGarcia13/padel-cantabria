import type { DatabaseClient } from '@padel-cantabria/database';
import type { FastifyPluginAsync } from 'fastify';
import { searchPhasesHandler } from '../handlers/search-phases.js';
import { parseOptionalPositiveInt } from '../parse-query.js';

export function createPhasesRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get<{
      Querystring: {
        q?: string;
        gender?: string;
        limit?: string;
      };
    }>('/phases/search', async (request) => {
      return searchPhasesHandler(db, {
        q: request.query.q,
        gender: request.query.gender,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });
  };
}
