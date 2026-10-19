import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { requireCategoryMatch } from '../config/require-category-match.js';
import { resolveCategoryMatchResult } from '../config/resolve-category-value.js';
import { badRequest } from '../errors.js';
import { presentPlayers } from '../presenters/present-player.js';

const DEFAULT_LIMIT = 5;

export interface GetTopPlayersQuery {
  gender?: string;
  category?: string;
  limit?: number;
}

export async function getTopPlayersHandler(
  db: DatabaseClient,
  { gender, category, limit = DEFAULT_LIMIT }: GetTopPlayersQuery,
) {
  const normalizedGender = normalizeGender(gender);

  if (!normalizedGender) {
    throw badRequest('Missing gender (use M or F, or ask the user)');
  }

  if (!category?.trim()) {
    throw badRequest('Missing category');
  }

  const leagueId = getConfiguredLeagueId();
  const resolved = await resolveCategoryMatchResult(db, {
    category,
    leagueId,
    gender: normalizedGender,
  });
  const categoryMatch = requireCategoryMatch(resolved);

  const players = await db.getTopPlayers({
    league_id: leagueId,
    gender: normalizedGender,
    category: categoryMatch.category,
    limit,
  });

  return presentPlayers(players);
}
