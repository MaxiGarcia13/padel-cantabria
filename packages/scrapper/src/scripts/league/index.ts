import process from 'node:process';
import { createClientFromEnv } from '@padel-cantabria/database';
import { scrapeLeagues } from './scrape-leagues.js';

async function main(): Promise<void> {
  const db = createClientFromEnv();
  const leagues = await scrapeLeagues();
  await db.upsertLeagues(leagues);
  console.warn(`Saved ${leagues.length} league(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
