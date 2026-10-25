import type { TursoConfig } from './connection.js';
import { createConnection } from './connection.js';
import { createScraperReads } from './scraper-reads.js';
import { createSharedReads } from './shared-reads.js';
import { createWrites } from './writes.js';

export function createScraperClient(params: TursoConfig) {
  const connection = createConnection(params);

  return {
    ...createSharedReads(connection),
    ...createScraperReads(connection),
    ...createWrites(connection),
  };
}

export type ScraperDatabaseClient = ReturnType<typeof createScraperClient>;
