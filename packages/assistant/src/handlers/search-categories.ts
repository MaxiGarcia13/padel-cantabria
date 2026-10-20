import type { DatabaseClient } from '@padel-cantabria/database';
import {

  getConfiguredLeagueId,
} from '@padel-cantabria/database';
import { normalizeCategoryQuery } from '@padel-cantabria/shared';
import { normalizeGender } from '../config/normalize-gender.js';
import { presentCategories } from '../presenters/present-category.js';

const DEFAULT_LIMIT = 15;

export interface SearchCategoriesQuery {
  q?: string;
  gender?: string;
  limit?: number;
}

export async function searchCategoriesHandler(
  db: DatabaseClient,
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
