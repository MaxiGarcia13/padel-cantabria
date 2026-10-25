import type { McpDatabaseClient } from '@padel-cantabria/database';
import { requireConfiguredCategory } from '../config/require-configured-category.js';
import { presentPlayers } from '../presenters/present-player.js';

const DEFAULT_LIMIT = 5;

export interface GetTopPlayersQuery {
  gender?: string;
  category?: string;
  limit?: number;
}

export async function getTopPlayersHandler(
  db: McpDatabaseClient,
  { gender, category, limit = DEFAULT_LIMIT }: GetTopPlayersQuery,
) {
  const {
    leagueId,
    gender: normalizedGender,
    categoryMatch,
  } = await requireConfiguredCategory(db, { gender, category });

  const players = await db.getTopPlayers({
    league_id: leagueId,
    gender: normalizedGender,
    category: categoryMatch.category,
    limit,
  });

  return presentPlayers(players);
}
