import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseClient } from '../db.js';
import { listCategories } from '../handlers/list-categories.js';
import { searchCategoriesHandler } from '../handlers/search-categories.js';
import { parseOptionalPositiveInt } from '../parse-query.js';

export function createCategoriesRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get('/categories', async () => listCategories(db));

    app.get<{
      Querystring: {
        q?: string;
        gender?: string;
        limit?: string;
      };
    }>('/categories/search', async (request) => {
      return searchCategoriesHandler(db, {
        q: request.query.q,
        gender: request.query.gender,
        limit: parseOptionalPositiveInt(request.query.limit),
      });
    });
  };
}
