import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';
import type { Team, TeamWithStandings } from '../types/team.js';

const TEAM_COLUMNS = `
  id,
  league_id,
  gender,
  category,
  name
`;

const TEAM_WITH_STANDINGS_COLUMNS = `
  teams.id,
  teams.league_id,
  teams.gender,
  teams.category,
  teams.name,
  team_standings.position,
  team_standings.previous_position,
  team_standings.confrontations_played,
  team_standings.points,
  team_standings.matches_played,
  team_standings.matches_won,
  team_standings.sets_for,
  team_standings.sets_against,
  team_standings.sets_average,
  team_standings.games_for,
  team_standings.games_against,
  team_standings.games_average
`;

export async function getTeams(
  connection: Connection,
): Promise<Team[]>;
export async function getTeams(
  connection: Connection,
  category: CategoryKey,
): Promise<TeamWithStandings[]>;
export async function getTeams(
  connection: Connection,
  category?: CategoryKey,
): Promise<Team[] | TeamWithStandings[]> {
  if (category) {
    const [result] = await connection.batch(
      [
        {
          sql: `
            SELECT
              ${TEAM_WITH_STANDINGS_COLUMNS}
            FROM teams
            LEFT JOIN team_standings
              ON team_standings.team_id = teams.id
              AND team_standings.league_id = ?
              AND team_standings.gender = ?
              AND team_standings.phase = ?
              AND team_standings.category = ?
            WHERE teams.league_id = ?
              AND teams.gender = ?
              AND teams.category = ?
            ORDER BY
              CASE WHEN team_standings.position IS NULL THEN 1 ELSE 0 END,
              team_standings.position,
              teams.name
          `,
          args: [
            category.league_id,
            category.gender,
            category.phase,
            category.category,
            category.league_id,
            category.gender,
            category.category,
          ],
        },
      ],
      'read',
    );

    return result.rows as TeamWithStandings[];
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
