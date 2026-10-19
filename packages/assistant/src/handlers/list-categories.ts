import type { DatabaseClient } from '../db.js';

export async function listCategories(db: DatabaseClient) {
  return db.getLeagues();
}
