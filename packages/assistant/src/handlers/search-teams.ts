import type { DatabaseClient } from '../db.js';

const DEFAULT_LIMIT = 10;

export interface SearchTeamsQuery {
  q?: string;
  limit?: number;
}

export async function searchTeamsHandler(
  db: DatabaseClient,
  { q = '', limit = DEFAULT_LIMIT }: SearchTeamsQuery,
) {
  return db.searchTeams({ query: q, limit });
}
