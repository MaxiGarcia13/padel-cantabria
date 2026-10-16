import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey, Match } from '../types/match.js';

export async function getMatches(
  connection: Connection,
  category: CategoryKey,
): Promise<Match[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            league_id,
            gender_value,
            phase_value,
            category_value,
            id,
            home_team,
            away_team,
            date,
            status,
            location,
            schedule
          FROM matches
          WHERE league_id = ?
            AND gender_value = ?
            AND phase_value = ?
            AND category_value = ?
          ORDER BY id
        `,
        args: [
          category.league_id,
          category.gender_value,
          category.phase_value,
          category.category_value,
        ],
      },
    ],
    'read',
  );

  return result.rows as Match[];
}
