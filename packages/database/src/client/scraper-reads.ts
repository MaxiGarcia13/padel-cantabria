import type { Connection } from '@tursodatabase/serverless';
import type { GetAllMatchesParams } from '../repositories/get-all-matches.js';
import type { GetCategoriesParams } from '../repositories/get-categories.js';
import { getAllMatches } from '../repositories/get-all-matches.js';
import { getCategories } from '../repositories/get-categories.js';

export function createScraperReads(connection: Connection) {
  return {
    getCategories: (params?: GetCategoriesParams) =>
      getCategories(connection, params),
    getAllMatches: (params?: GetAllMatchesParams) =>
      getAllMatches(connection, params),
  };
}
