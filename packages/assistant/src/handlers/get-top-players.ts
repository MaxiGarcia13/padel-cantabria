import type { DatabaseClient } from '../db.js';
import { badRequest } from '../errors.js';

const DEFAULT_LIMIT = 5;

export interface GetTopPlayersQuery {
  league_id?: number;
  gender?: string;
  category?: string;
  limit?: number;
}

export async function getTopPlayersHandler(
  db: DatabaseClient,
  {
    league_id: leagueId,
    gender,
    category,
    limit = DEFAULT_LIMIT,
  }: GetTopPlayersQuery,
) {
  if (leagueId === undefined || !Number.isFinite(leagueId)) {
    throw badRequest('Missing or invalid league_id');
  }

  if (!gender?.trim()) {
    throw badRequest('Missing gender');
  }

  if (!category?.trim()) {
    throw badRequest('Missing category');
  }

  return db.getTopPlayers({
    league_id: leagueId,
    gender: gender.trim(),
    category: category.trim(),
    limit,
  });
}
