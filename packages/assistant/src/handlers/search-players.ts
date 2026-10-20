import type { DatabaseClient } from '@padel-cantabria/database';
import { getConfiguredLeagueId } from '@padel-cantabria/database';
import { normalizeGender } from '../config/normalize-gender.js';
import { presentPlayers } from '../presenters/present-player.js';

const DEFAULT_LIMIT = 15;

export interface SearchPlayersQuery {
  q?: string;
  gender?: string;
  limit?: number;
}

export async function searchPlayersHandler(
  db: DatabaseClient,
  { q = '', gender, limit = DEFAULT_LIMIT }: SearchPlayersQuery,
) {
  const players = await db.searchPlayers({
    query: q,
    league_id: getConfiguredLeagueId(),
    gender: normalizeGender(gender),
    limit,
  });

  return presentPlayers(players);
}
