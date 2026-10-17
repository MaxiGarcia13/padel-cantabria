import type { Connection } from '@tursodatabase/serverless';
import type { Match } from '../types/match.js';

export async function getMatchById(
  connection: Connection,
  id: number,
): Promise<Match | null> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            matches.league_id,
            matches.gender,
            matches.phase,
            matches.category,
            matches.id,
            matches.home_team_id,
            matches.away_team_id,
            home_team.name AS home_team,
            away_team.name AS away_team,
            matches.date,
            matches.status,
            matches.location,
            matches.schedule
          FROM matches
          INNER JOIN teams AS home_team ON home_team.id = matches.home_team_id
          INNER JOIN teams AS away_team ON away_team.id = matches.away_team_id
          WHERE matches.id = ?
        `,
        args: [id],
      },
    ],
    'read',
  );

  const match = result.rows[0] as Match | undefined;

  return match ?? null;
}
