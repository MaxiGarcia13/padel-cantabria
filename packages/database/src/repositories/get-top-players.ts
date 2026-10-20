import type { Connection } from '@tursodatabase/serverless';
import type { PlayerWithTeam } from '../types/player.js';
import { safeLimit } from '../utils/safe-limit.js';
import { PLAYER_WITH_TEAM_SELECT_SQL } from './player-with-team-sql.js';

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
    limit,
  }: GetTopPlayersParams,
): Promise<PlayerWithTeam[]> {
  const [result] = await connection.batch(
    [
      {
        sql: `
          ${PLAYER_WITH_TEAM_SELECT_SQL}
          WHERE teams.league_id = ?
            AND teams.gender = ?
            AND teams.category = ?
          ORDER BY team_players.points DESC, team_players.position ASC
          LIMIT ?
        `,
        args: [leagueId, gender, category, safeLimit(limit, DEFAULT_LIMIT)],
      },
    ],
    'read',
  );

  return result.rows as PlayerWithTeam[];
}
