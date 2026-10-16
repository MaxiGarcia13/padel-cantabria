import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';

export async function getTeams(connection: Connection): Promise<Team[]> {
  const [result] = await connection.batch(
    [
      `
        SELECT
          id,
          league_id,
          gender,
          category,
          name
        FROM teams
        ORDER BY league_id, gender, category, name
      `,
    ],
    'read',
  );

  return result.rows as Team[];
}
