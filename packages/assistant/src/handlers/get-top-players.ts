import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
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

  const players = await db.getTopPlayers({
    league_id: getConfiguredLeagueId(),
    gender: normalizedGender,
    category: category.trim(),
    limit,
  });

  return presentPlayers(players);
}
