import process from 'node:process';
import { createClient } from '@padel-cantabria/database';
import { scrapeLeagues } from './scrape-leagues.js';

async function main(): Promise<void> {
  const url = process.env.TURSO_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url || !authToken) {
    throw new Error('Missing TURSO_URL or TURSO_AUTH_TOKEN');
  }

  const db = createClient({ url, authToken });
  const leagues = await scrapeLeagues();
  await db.upsertLeagues(leagues);
  console.warn(`Saved ${leagues.length} league(s).`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
