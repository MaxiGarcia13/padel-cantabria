import type { Connection } from '@tursodatabase/serverless';
import { connect } from '@tursodatabase/serverless';

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
