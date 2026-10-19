import type { FastifyPluginAsync } from 'fastify';
import type { DatabaseClient } from '../db.js';
import { listCategories } from '../handlers/list-categories.js';

export function createCategoriesRoutes(db: DatabaseClient): FastifyPluginAsync {
  return async (app) => {
    app.get('/categories', async () => listCategories(db));
  };
}
