import type { Connection } from '@tursodatabase/serverless';
import type { League } from './types/league.js';
import { connect } from '@tursodatabase/serverless';
import { getLeagues } from './repositories/get-leagues.js';
import { upsertLeagues } from './repositories/upsert-leagues.js';

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
    upsertLeagues: (leagues: League[]) => upsertLeagues(leagues, connection),
  };
}
