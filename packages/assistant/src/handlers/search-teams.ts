import type { DatabaseClient } from '../db.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { presentTeams } from '../presenters/present-team.js';

const DEFAULT_LIMIT = 15;

export interface SearchTeamsQuery {
  q?: string;
  limit?: number;
}

export async function searchTeamsHandler(
  db: DatabaseClient,
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
