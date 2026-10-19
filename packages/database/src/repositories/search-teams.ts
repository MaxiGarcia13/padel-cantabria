import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';

export interface SearchTeamsParams {
  query?: string;
  league_id?: number;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

/**
 * Name search used by the web autocomplete and the assistant.
 * Returns the plain `Team` shape (no label joins) so web clients stay stable.
 */
export async function searchTeams(
  connection: Connection,
  {
    query = '',
    league_id: leagueId,
    limit = DEFAULT_LIMIT,
  }: SearchTeamsParams = {},
): Promise<Team[]> {
  const tokens = tokenizeQuery(query);
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    tokenClauses.push(`LOWER(name) LIKE '%' || LOWER(?) || '%'`);
    tokenArgs.push(token);
  }

  const nameFilterSql
    = tokenClauses.length === 0
      ? '1 = 1'
      : tokenClauses.join('\n            AND ');

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
            ${nameFilterSql}
            AND (? IS NULL OR league_id = ?)
          ORDER BY name
          LIMIT ?
        `,
        args: [...tokenArgs, leagueId ?? null, leagueId ?? null, safeLimit],
      },
    ],
    'read',
  );

  return result.rows as Team[];
}
