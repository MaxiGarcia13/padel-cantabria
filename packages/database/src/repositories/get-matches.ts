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
            matches.rounds
          FROM matches
          INNER JOIN teams AS home_team ON home_team.id = matches.home_team_id
          INNER JOIN teams AS away_team ON away_team.id = matches.away_team_id
          WHERE matches.league_id = ?
            AND matches.gender = ?
            AND matches.phase = ?
            AND matches.category = ?
          ORDER BY matches.id
        `,
        args: [
          category.league_id,
          category.gender,
          category.phase,
          category.category,
        ],
      },
    ],
    'read',
  );

  return result.rows as Match[];
}
