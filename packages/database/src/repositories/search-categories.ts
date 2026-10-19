import type { Connection } from '@tursodatabase/serverless';
import type { CategoryMatch } from '../types/category-match.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';

export interface SearchCategoriesParams {
  query?: string;
  league_id?: number;
  gender?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

export async function searchCategories(
  connection: Connection,
  {
    query = '',
    league_id: leagueId,
    gender,
    limit = DEFAULT_LIMIT,
  }: SearchCategoriesParams = {},
): Promise<CategoryMatch[]> {
  const tokens = tokenizeQuery(query);
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    tokenClauses.push(`(
      LOWER(categories.label) LIKE '%' || LOWER(?) || '%'
      OR LOWER(categories.value) LIKE '%' || LOWER(?) || '%'
      OR LOWER(genders.label) LIKE '%' || LOWER(?) || '%'
      OR LOWER(genders.value) LIKE '%' || LOWER(?) || '%'
      OR LOWER(phases.label) LIKE '%' || LOWER(?) || '%'
      OR LOWER(phases.value) LIKE '%' || LOWER(?) || '%'
      OR LOWER(leagues.name) LIKE '%' || LOWER(?) || '%'
    )`);
    tokenArgs.push(token, token, token, token, token, token, token);
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
            categories.league_id,
            leagues.name AS league_name,
            categories.gender,
            genders.label AS gender_label,
            categories.phase,
            phases.label AS phase_label,
            categories.value AS category,
            categories.label AS category_label
          FROM categories
          INNER JOIN leagues ON leagues.id = categories.league_id
          INNER JOIN genders
            ON genders.league_id = categories.league_id
            AND genders.value = categories.gender
          INNER JOIN phases
            ON phases.league_id = categories.league_id
            AND phases.gender = categories.gender
            AND phases.value = categories.phase
          WHERE
            ${textFilterSql}
            AND (? IS NULL OR categories.league_id = ?)
            AND (? IS NULL OR categories.gender = ?)
          ORDER BY
            leagues.name,
            genders.label,
            phases.label,
            categories.label
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

  return result.rows as CategoryMatch[];
}
