import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';
import { joinAndFilters } from '../utils/join-and-filters.js';
import { safeLimit } from '../utils/safe-limit.js';
import {
  teamNameRelevanceOrder,
  teamNameTokenClause,
} from '../utils/team-name-search.js';
import { tokenizeQuery } from '../utils/tokenize-query.js';

export interface SearchTeamsParams {
  query?: string;
  league_id?: number;
  league_ids?: number[];
  limit?: number;
}

const DEFAULT_LIMIT = 15;

function resolveLeagueIds({
  league_id: leagueId,
  league_ids: leagueIds,
}: SearchTeamsParams): number[] | null {
  if (leagueIds && leagueIds.length > 0) {
    return leagueIds;
  }

  if (leagueId != null) {
    return [leagueId];
  }

  return null;
}

export async function searchTeams(
  connection: Connection,
  params: SearchTeamsParams = {},
): Promise<Team[]> {
  const { query = '', limit } = params;
  const tokens = tokenizeQuery(query);
  const resolvedLeagueIds = resolveLeagueIds(params);

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    const fragment = teamNameTokenClause(token);
    tokenClauses.push(fragment.sql);
    tokenArgs.push(...fragment.args);
  }

  const relevance = teamNameRelevanceOrder(query);

  const leagueFilterSql
    = resolvedLeagueIds == null
      ? '1 = 1'
      : `league_id IN (${resolvedLeagueIds.map(() => '?').join(', ')})`;

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            id,
            league_id,
            gender,
            category,
            name
          FROM teams
          WHERE
            ${joinAndFilters(tokenClauses)}
            AND ${leagueFilterSql}
          ORDER BY ${relevance.sql}
          LIMIT ?
        `,
        args: [
          ...tokenArgs,
          ...(resolvedLeagueIds ?? []),
          ...relevance.args,
          safeLimit(limit, DEFAULT_LIMIT),
        ],
      },
    ],
    'read',
  );

  return result.rows as Team[];
}
