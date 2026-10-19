import type { Connection } from '@tursodatabase/serverless';
import type { PlayerWithTeam } from '../types/player.js';

export interface GetTopPlayersParams {
  league_id: number;
  gender: string;
  category: string;
  limit?: number;
}

const DEFAULT_LIMIT = 5;

export async function getTopPlayers(
  connection: Connection,
  {
    league_id: leagueId,
    gender,
    category,
    limit = DEFAULT_LIMIT,
  }: GetTopPlayersParams,
): Promise<PlayerWithTeam[]> {
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            team_players.team_id,
            team_players.position,
            team_players.previous_position,
            team_players.surname,
            team_players.name,
            team_players.points,
            team_players.previous_points,
            teams.name AS team_name,
            teams.league_id,
            teams.gender,
            teams.category
          FROM team_players
          INNER JOIN teams ON teams.id = team_players.team_id
          WHERE teams.league_id = ?
            AND teams.gender = ?
            AND teams.category = ?
          ORDER BY team_players.points DESC, team_players.position ASC
          LIMIT ?
        `,
        args: [leagueId, gender, category, safeLimit],
      },
    ],
    'read',
  );

  return result.rows as PlayerWithTeam[];
}
