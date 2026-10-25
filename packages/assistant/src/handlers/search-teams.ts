import type { McpDatabaseClient } from '@padel-cantabria/database';
import {

  getConfiguredLeagueId,
} from '@padel-cantabria/database';
import { presentTeams } from '../presenters/present-team.js';

const DEFAULT_LIMIT = 15;

export interface SearchTeamsQuery {
  q?: string;
  limit?: number;
}

export async function searchTeamsHandler(
  db: McpDatabaseClient,
  { q = '', limit = DEFAULT_LIMIT }: SearchTeamsQuery,
) {
  const [teams, leagues] = await Promise.all([
    db.searchTeams({
      query: q,
      league_id: getConfiguredLeagueId(),
      limit,
    }),
    db.getLeagues(),
  ]);

  return presentTeams(teams, leagues);
}
