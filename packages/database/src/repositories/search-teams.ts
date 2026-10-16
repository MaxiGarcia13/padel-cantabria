import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';

export interface SearchTeamsParams {
  query?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 10;

export async function searchTeams(
  connection: Connection,
  { query = '', limit = DEFAULT_LIMIT }: SearchTeamsParams = {},
): Promise<Team[]> {
  const normalizedQuery = query.trim();
  const safeLimit = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            id,
            league_id,
            gender,
            category,
            name
          FROM teams
          WHERE
            ? = ''
            OR LOWER(name) LIKE '%' || LOWER(?) || '%'
          ORDER BY name
          LIMIT ?
        `,
        args: [normalizedQuery, normalizedQuery, safeLimit],
      },
    ],
    'read',
  );

  return result.rows as Team[];
}
