import type { Connection } from '@tursodatabase/serverless';
import type { TeamRecord } from '../types/db.js';
import type { Team } from '../types/team.js';

export async function getTeams(connection: Connection): Promise<Team[]> {
  const [result] = await connection.batch(
    [
      `
        SELECT
          id,
          league_id,
          gender,
          phase,
          category,
          name,
          confirmed
        FROM teams
        ORDER BY league_id, gender, phase, category, name
      `,
    ],
    'read',
  );

  return (result.rows as TeamRecord[]).map((row) => ({
    id: row.id,
    league_id: row.league_id,
    gender: row.gender,
    phase: row.phase,
    category: row.category,
    name: row.name,
    confirmed: row.confirmed === 1,
  }));
}
