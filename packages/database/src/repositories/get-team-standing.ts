import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';
import type { TeamWithStandings } from '../types/team-standings.js';

export async function getTeamStanding(
  connection: Connection,
  teamId: number,
  category: CategoryKey,
): Promise<TeamWithStandings | null> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
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
          FROM teams
          INNER JOIN team_standings
            ON team_standings.team_id = teams.id
            AND team_standings.league_id = ?
            AND team_standings.gender = ?
            AND team_standings.phase = ?
            AND team_standings.category = ?
          WHERE teams.id = ?
        `,
        args: [
          category.league_id,
          category.gender,
          category.phase,
          category.category,
          teamId,
        ],
      },
    ],
    'read',
  );

  const standing = result.rows[0] as TeamWithStandings | undefined;

  return standing ?? null;
}
