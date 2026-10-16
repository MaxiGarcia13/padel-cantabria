import process from 'node:process';
import { createDbClient } from '@/create-db-client.js';
import { parseLeagueIds } from '../league/parse-league-ids.js';
import { scrapeCalendars } from './scrape-calendars.js';

async function main(): Promise<void> {
  const db = createDbClient();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const categories = (await db.getCategories()).filter(
    (category) =>
      allowedLeagueIds === null || allowedLeagueIds.has(category.league_id),
  );

  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const matches = await scrapeCalendars(categories);
  await db.upsertMatches(matches);
  console.warn(
    `Saved ${matches.length} match(es) from ${categories.length} category(ies).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
