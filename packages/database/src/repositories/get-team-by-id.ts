import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';

export async function getTeamById(
  connection: Connection,
  id: number,
): Promise<Team | null> {
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
          WHERE id = ?
        `,
        args: [id],
      },
    ],
    'read',
  );

  const team = result.rows[0] as Team | undefined;

  return team ?? null;
}
