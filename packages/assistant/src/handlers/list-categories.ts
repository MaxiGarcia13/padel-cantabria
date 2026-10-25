import type { McpDatabaseClient } from '@padel-cantabria/database';
import { presentLeagues } from '../presenters/present-leagues.js';

export async function listCategories(db: McpDatabaseClient) {
  return presentLeagues(await db.getLeagues());
}
