import type { Connection } from '@tursodatabase/serverless';
import type { PlayerWithTeam } from '../types/player.js';

export interface SearchPlayersParams {
  query?: string;
  league_id?: number;
  gender?: string;
  category?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 10;

export async function searchPlayers(
  connection: Connection,
  {
    query = '',
    league_id: leagueId,
    gender,
    category,
    limit = DEFAULT_LIMIT,
  }: SearchPlayersParams = {},
): Promise<PlayerWithTeam[]> {
  const normalizedQuery = query.trim();
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
          WHERE
            (
              ? = ''
              OR LOWER(team_players.name) LIKE '%' || LOWER(?) || '%'
              OR LOWER(team_players.surname) LIKE '%' || LOWER(?) || '%'
              OR LOWER(team_players.name || ' ' || team_players.surname)
                LIKE '%' || LOWER(?) || '%'
              OR LOWER(team_players.surname || ' ' || team_players.name)
                LIKE '%' || LOWER(?) || '%'
            )
            AND (? IS NULL OR teams.league_id = ?)
            AND (? IS NULL OR teams.gender = ?)
            AND (? IS NULL OR teams.category = ?)
          ORDER BY team_players.points DESC, team_players.surname, team_players.name
          LIMIT ?
        `,
        args: [
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
          normalizedQuery,
          leagueId ?? null,
          leagueId ?? null,
          gender ?? null,
          gender ?? null,
          category ?? null,
          category ?? null,
          safeLimit,
        ],
      },
    ],
    'read',
  );

  return result.rows as PlayerWithTeam[];
}
