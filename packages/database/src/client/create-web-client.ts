import type { TursoConfig } from './connection.js';
import { createConnection } from './connection.js';
import { createSharedReads } from './shared-reads.js';
import { createWebReads } from './web-reads.js';

export function createWebClient(params: TursoConfig) {
  const connection = createConnection(params);

  return {
    ...createSharedReads(connection),
    ...createWebReads(connection),
  };
}

export type WebDatabaseClient = ReturnType<typeof createWebClient>;
