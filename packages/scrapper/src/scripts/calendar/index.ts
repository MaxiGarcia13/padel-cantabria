import process from 'node:process';
import {
  createClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { loadPreviousPositions } from './load-previous-positions.js';
import { scrapeCalendars } from './scrape-calendars.js';

async function main(): Promise<void> {
  const db = createClientFromEnv();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const leagueIds = allowedLeagueIds ? [...allowedLeagueIds] : null;
  const categories = await db.getCategories({ leagueIds });

  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const teams = await db.getTeams({ leagueIds });

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

runScrapeScript(main);
