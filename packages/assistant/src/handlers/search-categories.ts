import type { McpDatabaseClient } from '@padel-cantabria/database';
import {

  getConfiguredLeagueId,
} from '@padel-cantabria/database';
import {
  normalizeCategoryQuery,
  normalizeGender,
} from '@padel-cantabria/shared';
import { presentCategories } from '../presenters/present-category.js';

const DEFAULT_LIMIT = 15;

export interface SearchCategoriesQuery {
  q?: string;
  gender?: string;
  limit?: number;
}

export async function searchCategoriesHandler(
  db: McpDatabaseClient,
  { q = '', gender, limit = DEFAULT_LIMIT }: SearchCategoriesQuery,
) {
  const categories = await db.searchCategories({
    query: normalizeCategoryQuery(q),
    league_id: getConfiguredLeagueId(),
    gender: normalizeGender(gender),
    limit,
  });

  return presentCategories(categories);
}
