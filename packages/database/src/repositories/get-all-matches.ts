import type { Connection } from '@tursodatabase/serverless';
import type { MatchWrite } from '../types/match.js';

export async function getAllMatches(
  connection: Connection,
): Promise<MatchWrite[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            league_id,
            gender,
            phase,
            category,
            id,
            home_team_id,
            away_team_id,
            date,
            status,
            location,
            rounds
          FROM matches
          ORDER BY league_id, gender, phase, category, id
        `,
      },
    ],
    'read',
  );

  return result.rows as MatchWrite[];
}
