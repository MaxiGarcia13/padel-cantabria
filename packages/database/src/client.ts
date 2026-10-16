import type { Connection } from '@tursodatabase/serverless';
import type { League } from './types/league.js';
import type { CategoryKey, MatchWrite } from './types/match.js';
import type { Team } from './types/team.js';
import { connect } from '@tursodatabase/serverless';
import { getCategories } from './repositories/get-categories.js';
import { getLeagues } from './repositories/get-leagues.js';
import { getMatches } from './repositories/get-matches.js';
import { getTeams } from './repositories/get-teams.js';
import { upsertLeagues } from './repositories/upsert-leagues.js';
import { upsertMatches } from './repositories/upsert-matches.js';
import { upsertTeams } from './repositories/upsert-teams.js';

export interface TursoConfig {
  url: string;
  authToken: string;
}

export function createConnection({ url, authToken }: TursoConfig): Connection {
  if (!url || !authToken) {
    throw new Error('Missing Turso url or authToken');
  }

  return connect({ url, authToken });
}

export function createClient(params: TursoConfig) {
  const connection = createConnection(params);

  return {
    getLeagues: () => getLeagues(connection),
    getCategories: () => getCategories(connection),
    getTeams: (category?: CategoryKey) => getTeams(connection, category),
    getMatches: (category: CategoryKey) => getMatches(connection, category),

    upsertLeagues: (leagues: League[]) => upsertLeagues(leagues, connection),
    upsertTeams: (teams: Team[]) => upsertTeams(teams, connection),
    upsertMatches: (matches: MatchWrite[]) => upsertMatches(matches, connection),
  };
}
