import process from 'node:process';
import {
  createClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { scrapeTeams } from './scrape-teams.js';

async function main(): Promise<void> {
  const db = createClientFromEnv();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const categories = (await db.getCategories()).filter(
    (category) =>
      allowedLeagueIds === null || allowedLeagueIds.has(category.league_id),
  );

  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const teams = await scrapeTeams(categories);
  await db.upsertTeams(teams);
  console.warn(
    `Saved ${teams.length} team(s) from ${categories.length} category(ies).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
