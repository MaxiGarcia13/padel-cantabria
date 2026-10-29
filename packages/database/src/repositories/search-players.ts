import type { Connection } from '@tursodatabase/serverless';
import type { PlayerWithTeam } from '../types/player.js';
import { joinAndFilters } from '../utils/join-and-filters.js';
import { safeLimit } from '../utils/safe-limit.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';
import { PLAYER_WITH_TEAM_SELECT_SQL } from './player-with-team-sql.js';

export interface SearchPlayersParams {
  query?: string;
  league_id?: number;
  gender?: string;
  category?: string;
  limit?: number;
}

const DEFAULT_LIMIT = 15;

function playerNameTokenFilter(tokens: string[]): {
  sql: string;
  args: string[];
} {
  const clauses: string[] = [];
  const args: string[] = [];

  for (const token of tokens) {
    clauses.push(`(
      LOWER(team_players.name) LIKE '%' || LOWER(?) || '%'
      OR LOWER(team_players.surname) LIKE '%' || LOWER(?) || '%'
    )`);
    args.push(token, token);
  }

  return {
    sql: joinAndFilters(clauses),
    args,
  };
}

export async function searchPlayers(
  connection: Connection,
  {
    query = '',
    league_id: leagueId,
    gender,
    category,
    limit,
  }: SearchPlayersParams = {},
): Promise<PlayerWithTeam[]> {
  const nameFilter = playerNameTokenFilter(tokenizeQuery(query));

  const [result] = await connection.batch(
    [
      {
        sql: `
          ${PLAYER_WITH_TEAM_SELECT_SQL}
          WHERE
            ${nameFilter.sql}
            AND (? IS NULL OR teams.league_id = ?)
            AND (? IS NULL OR teams.gender = ?)
            AND (? IS NULL OR teams.category = ?)
          ORDER BY team_players.points DESC, team_players.surname, team_players.name
          LIMIT ?
        `,
        args: [
          ...nameFilter.args,
          leagueId ?? null,
          leagueId ?? null,
          gender ?? null,
          gender ?? null,
          category ?? null,
          category ?? null,
          safeLimit(limit, DEFAULT_LIMIT),
        ],
      },
    ],
    'read',
  );

  return result.rows as PlayerWithTeam[];
}
