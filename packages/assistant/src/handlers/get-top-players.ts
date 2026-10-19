import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { resolveCategoryValue } from '../config/resolve-category-value.js';
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
  const categoryValue = await resolveCategoryValue(db, {
    category,
    leagueId,
    gender: normalizedGender,
  });

  if (!categoryValue) {
    throw badRequest(
      'Unknown or ambiguous category; use search_categories or ask the user',
    );
  }

  const players = await db.getTopPlayers({
    league_id: leagueId,
    gender: normalizedGender,
    category: categoryValue,
    limit,
  });

  return presentPlayers(players);
}
