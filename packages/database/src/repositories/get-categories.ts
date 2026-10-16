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
          gender_value,
          phase_value,
          value AS category_value
        FROM categories
        ORDER BY league_id, gender_value, phase_value, value
      `,
    ],
    'read',
  );

  return result.rows as CategoryKey[];
}
