import type { DatabaseClient } from '@padel-cantabria/database';
import { presentLeagues } from '../presenters/present-leagues.js';

export async function listCategories(db: DatabaseClient) {
  return presentLeagues(await db.getLeagues());
}
