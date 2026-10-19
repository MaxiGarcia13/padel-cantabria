import type { DatabaseClient } from '../db.js';

const DEFAULT_LIMIT = 10;

export interface SearchPlayersQuery {
  q?: string;
  league_id?: number;
  gender?: string;
  category?: string;
  limit?: number;
}

export async function searchPlayersHandler(
  db: DatabaseClient,
  {
    q = '',
    league_id: leagueId,
    gender,
    category,
    limit = DEFAULT_LIMIT,
  }: SearchPlayersQuery,
) {
  return db.searchPlayers({
    query: q,
    league_id: leagueId,
    gender,
    category,
    limit,
  });
}
