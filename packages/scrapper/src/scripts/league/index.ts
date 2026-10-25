import { createScraperClientFromEnv } from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { scrapeLeagues } from './scrape-leagues.js';

async function main(): Promise<void> {
  const db = createScraperClientFromEnv();
  const leagues = await scrapeLeagues();
  await db.upsertLeagues(leagues);
  console.warn(`Saved ${leagues.length} league(s).`);
}

runScrapeScript(main);
