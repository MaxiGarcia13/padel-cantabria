import type { Connection } from '@tursodatabase/serverless';
import type { PhaseMatch } from '../types/phase-match.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';

export interface SearchPhasesParams {
  query?: string;
  league_id?: number;
  gender?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

export async function searchPhases(
  connection: Connection,
  {
    query = '',
    league_id: leagueId,
    gender,
    limit = DEFAULT_LIMIT,
  }: SearchPhasesParams = {},
): Promise<PhaseMatch[]> {
  const tokens = tokenizeQuery(query);
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    tokenClauses.push(`(
      LOWER(phases.label) LIKE '%' || LOWER(?) || '%'
      OR LOWER(phases.value) LIKE '%' || LOWER(?) || '%'
      OR LOWER(genders.label) LIKE '%' || LOWER(?) || '%'
      OR LOWER(genders.value) LIKE '%' || LOWER(?) || '%'
      OR LOWER(leagues.name) LIKE '%' || LOWER(?) || '%'
    )`);
    tokenArgs.push(token, token, token, token, token);
  }

  const textFilterSql
    = tokenClauses.length === 0
      ? '1 = 1'
      : tokenClauses.join('\n            AND ');

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            phases.league_id,
            leagues.name AS league_name,
            phases.gender,
            genders.label AS gender_label,
            phases.value AS phase,
            phases.label AS phase_label
          FROM phases
          INNER JOIN leagues ON leagues.id = phases.league_id
          INNER JOIN genders
            ON genders.league_id = phases.league_id
            AND genders.value = phases.gender
          WHERE
            ${textFilterSql}
            AND (? IS NULL OR phases.league_id = ?)
            AND (? IS NULL OR phases.gender = ?)
          ORDER BY
            leagues.name,
            genders.label,
            phases.label
          LIMIT ?
        `,
        args: [
          ...tokenArgs,
          leagueId ?? null,
          leagueId ?? null,
          gender ?? null,
          gender ?? null,
          safeLimit,
        ],
      },
    ],
    'read',
  );

  return result.rows as PhaseMatch[];
}
