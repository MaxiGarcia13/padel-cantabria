import type { Connection } from '@tursodatabase/serverless';
import type { PlayerWithTeam } from '../types/player.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';

export interface SearchPlayersParams {
  query?: string;
  league_id?: number;
  gender?: string;
  category?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

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
  const tokens = tokenizeQuery(query);
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    tokenClauses.push(`(
      LOWER(team_players.name) LIKE '%' || LOWER(?) || '%'
      OR LOWER(team_players.surname) LIKE '%' || LOWER(?) || '%'
    )`);
    tokenArgs.push(token, token);
  }

  const nameFilterSql
    = tokenClauses.length === 0
      ? '1 = 1'
      : tokenClauses.join('\n            AND ');

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
            leagues.name AS league_name,
            teams.gender,
            genders.label AS gender_label,
            teams.category,
            (
              SELECT categories.label
              FROM categories
              WHERE categories.league_id = teams.league_id
                AND categories.gender = teams.gender
                AND categories.value = teams.category
              LIMIT 1
            ) AS category_label
          FROM team_players
          INNER JOIN teams ON teams.id = team_players.team_id
          INNER JOIN leagues ON leagues.id = teams.league_id
          INNER JOIN genders
            ON genders.league_id = teams.league_id
            AND genders.value = teams.gender
          WHERE
            ${nameFilterSql}
            AND (? IS NULL OR teams.league_id = ?)
            AND (? IS NULL OR teams.gender = ?)
            AND (? IS NULL OR teams.category = ?)
          ORDER BY team_players.points DESC, team_players.surname, team_players.name
          LIMIT ?
        `,
        args: [
          ...tokenArgs,
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
