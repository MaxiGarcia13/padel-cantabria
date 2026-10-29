import process from 'node:process';
import {
  createScraperClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { scrapeTeams } from './scrape-teams.js';

async function main(): Promise<void> {
  const db = createScraperClientFromEnv();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const leagueIds = allowedLeagueIds
    ? [...allowedLeagueIds]
    : null;
  const categories = await db.getCategories({ leagueIds });

  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const teams = await scrapeTeams(categories);
  await db.upsertTeams(teams);
  console.warn(
    `Saved ${teams.length} team(s) from ${categories.length} category(ies).`,
  );
}

runScrapeScript(main);
