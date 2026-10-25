import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';
import type { ListScopeParams } from '../utils/list-scope.js';
import { buildListScopeFilter } from '../utils/list-scope.js';

export type GetCategoriesParams = ListScopeParams;

export async function getCategories(
  connection: Connection,
  params: GetCategoriesParams = {},
): Promise<CategoryKey[]> {
  const scope = buildListScopeFilter(params);

  const [result] = await connection.batch(
    [
      {
        sql: `
          SELECT
            league_id,
            gender,
            phase,
            value AS category
          FROM categories
          WHERE ${scope.sql}
          ORDER BY league_id, gender, phase, value
        `,
        args: scope.args,
      },
    ],
    'read',
  );

  return result.rows as CategoryKey[];
}
