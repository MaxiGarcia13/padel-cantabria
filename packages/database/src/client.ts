import type { Connection } from '@tursodatabase/serverless';
import type { League } from './types/league.js';
import type { Match } from './types/match.js';
import { connect } from '@tursodatabase/serverless';
import { getCategories } from './repositories/get-categories.js';
import { getLeagues } from './repositories/get-leagues.js';
import { upsertLeagues } from './repositories/upsert-leagues.js';
import { upsertMatches } from './repositories/upsert-matches.js';

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
    upsertLeagues: (leagues: League[]) => upsertLeagues(leagues, connection),
    upsertMatches: (matches: Match[]) => upsertMatches(matches, connection),
  };
}
