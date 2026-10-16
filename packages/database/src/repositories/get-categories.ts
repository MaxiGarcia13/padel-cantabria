import type { Connection } from '@tursodatabase/serverless';
import type { CategoryKey } from '../types/match.js';

export async function getCategories(
  connection: Connection,
): Promise<CategoryKey[]> {
  const [result] = await connection.batch(
    [
      `
        SELECT
          league_id,
          gender,
          phase,
          value AS category
        FROM categories
        ORDER BY league_id, gender, phase, value
      `,
    ],
    'read',
  );

  return result.rows as CategoryKey[];
}
