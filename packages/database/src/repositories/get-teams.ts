import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';
import type { Team } from '../types/team.js';

const TEAM_COLUMNS = `
  id,
  league_id,
  gender,
  category,
  name,
  position,
  previous_position,
  confrontations_played,
  points,
  matches_played,
  matches_won,
  sets_for,
  sets_against,
  sets_average,
  games_for,
  games_against,
  games_average
`;

export async function getTeams(
  connection: Connection,
  category?: CategoryKey,
): Promise<Team[]> {
  if (category) {
    const [result] = await connection.batch(
      [
        {
          sql: `
            SELECT
              ${TEAM_COLUMNS}
            FROM teams
            WHERE league_id = ?
              AND gender = ?
              AND category = ?
            ORDER BY
              CASE WHEN position IS NULL THEN 1 ELSE 0 END,
              position,
              name
          `,
          args: [category.league_id, category.gender, category.category],
        },
      ],
      'read',
    );

    return result.rows as Team[];
  }

  const [result] = await connection.batch(
    [
      `
        SELECT
          ${TEAM_COLUMNS}
        FROM teams
        ORDER BY league_id, gender, category, name
      `,
    ],
    'read',
  );

  return result.rows as Team[];
}
