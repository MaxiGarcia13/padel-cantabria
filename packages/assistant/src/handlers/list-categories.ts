import type { DatabaseClient } from '../db.js';
import { presentLeagues } from '../presenters/present-leagues.js';

export async function listCategories(db: DatabaseClient) {
  return presentLeagues(await db.getLeagues());
}
