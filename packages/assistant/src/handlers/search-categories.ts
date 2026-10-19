import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
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
    query: q,
    league_id: getConfiguredLeagueId(),
    gender: normalizeGender(gender),
    limit,
  });

  return presentCategories(categories);
}
