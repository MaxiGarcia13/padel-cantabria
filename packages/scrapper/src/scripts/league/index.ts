import process from 'node:process';
import { createDbClient } from '@/create-db-client.js';
import { scrapeLeagues } from './scrape-leagues.js';

async function main(): Promise<void> {
  const db = createDbClient();
  const leagues = await scrapeLeagues();
  await db.upsertLeagues(leagues);
  console.warn(`Saved ${leagues.length} league(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
