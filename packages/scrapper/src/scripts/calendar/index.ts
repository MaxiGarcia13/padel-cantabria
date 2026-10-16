import process from 'node:process';
import { createDbClient } from '@/create-db-client.js';
import { parseLeagueIds } from '../league/parse-league-ids.js';
import { loadPreviousPositions } from './load-previous-positions.js';
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

  const teams = (await db.getTeams()).filter(
    (team) =>
      allowedLeagueIds === null || allowedLeagueIds.has(team.league_id),
  );

  if (teams.length === 0) {
    throw new Error('No teams found. Run scrape:teams first.');
  }

  const previousPositions = await loadPreviousPositions(
    (category) => db.getTeams(category),
    categories,
  );

  const { matches, standings } = await scrapeCalendars(
    categories,
    teams,
    previousPositions,
  );

  await db.upsertMatches(matches);
  await db.upsertTeamStandings(standings);

  console.warn(
    `Saved ${matches.length} match(es) and ${standings.length} team standing(s) from ${categories.length} category(ies).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
