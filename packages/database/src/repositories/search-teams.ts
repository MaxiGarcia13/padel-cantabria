import type { Connection } from '@tursodatabase/serverless';
import type { Team } from '../types/team.js';
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
  const { query = '', limit = DEFAULT_LIMIT } = params;
  const tokens = tokenizeQuery(query);
  const safeLimit
    = Number.isFinite(limit) && limit > 0 ? Math.floor(limit) : DEFAULT_LIMIT;
  const resolvedLeagueIds = resolveLeagueIds(params);

  const tokenClauses: string[] = [];
  const tokenArgs: string[] = [];

  for (const token of tokens) {
    const fragment = teamNameTokenClause(token);
    tokenClauses.push(fragment.sql);
    tokenArgs.push(...fragment.args);
  }

  const nameFilterSql
    = tokenClauses.length === 0
      ? '1 = 1'
      : tokenClauses.join('\n            AND ');

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
            ${nameFilterSql}
            AND ${leagueFilterSql}
          ORDER BY ${relevance.sql}
          LIMIT ?
        `,
        args: [
          ...tokenArgs,
          ...(resolvedLeagueIds ?? []),
          ...relevance.args,
          safeLimit,
        ],
      },
    ],
    'read',
  );

  return result.rows as Team[];
}
