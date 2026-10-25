import type { Connection } from '@tursodatabase/serverless';
import type { MatchWrite } from '../types/match.js';
import type { ListScopeParams } from '../utils/list-scope.js';
import { buildListScopeFilter } from '../utils/list-scope.js';

export type GetAllMatchesParams = ListScopeParams;

export async function getAllMatches(
  connection: Connection,
  params: GetAllMatchesParams = {},
): Promise<MatchWrite[]> {
  const scope = buildListScopeFilter(params);

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            league_id,
            gender,
            phase,
            category,
            id,
            home_team_id,
            away_team_id,
            date,
            status,
            location,
            rounds
          FROM matches
          WHERE ${scope.sql}
          ORDER BY league_id, gender, phase, category, id
        `,
        args: scope.args,
      },
    ],
    'read',
  );

  return result.rows as MatchWrite[];
}
