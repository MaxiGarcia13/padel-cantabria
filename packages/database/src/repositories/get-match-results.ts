import type { Connection } from '@tursodatabase/serverless';
import type { MatchResult } from '../types/match-result.js';
import type { CategoryKey } from '../types/match.js';

const MATCH_RESULT_COLUMNS = `
  league_id,
  gender,
  phase,
  category,
  match_id,
  round,
  played_at,
  location,
  rounds_order,
  home_games,
  home_sets,
  home_matches,
  away_matches,
  away_sets,
  away_games
`;

export async function getMatchResults(
  connection: Connection,
  category: CategoryKey,
  matchIds?: number[],
): Promise<MatchResult[]> {
  if (matchIds !== undefined && matchIds.length === 0) {
    return [];
  }

  const [result] = await connection.batch(
    [
      matchIds === undefined
        ? {
            sql: `
              SELECT ${MATCH_RESULT_COLUMNS}
              FROM match_results
              WHERE league_id = ?
                AND gender = ?
                AND phase = ?
                AND category = ?
              ORDER BY match_id
            `,
            args: [
              category.league_id,
              category.gender,
              category.phase,
              category.category,
            ],
          }
        : {
            sql: `
              SELECT ${MATCH_RESULT_COLUMNS}
              FROM match_results
              WHERE league_id = ?
                AND gender = ?
                AND phase = ?
                AND category = ?
                AND match_id IN (${matchIds.map(() => '?').join(', ')})
              ORDER BY match_id
            `,
            args: [
              category.league_id,
              category.gender,
              category.phase,
              category.category,
              ...matchIds,
            ],
          },
    ],
    'read',
  );

  return result.rows as MatchResult[];
}
