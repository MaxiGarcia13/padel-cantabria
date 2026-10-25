import process from 'node:process';
import {
  createClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { scrapeResults } from './scrape-results.js';
import { selectResultCandidates } from './select-result-candidates.js';

async function main(): Promise<void> {
  const db = createClientFromEnv();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const leagues = (await db.getLeagues()).filter(
    (league) =>
      allowedLeagueIds === null || allowedLeagueIds.has(league.league_id),
  );

  if (leagues.length === 0) {
    throw new Error('No leagues found. Run scrape:leagues first.');
  }

  const matches = (await db.getAllMatches()).filter(
    (match) =>
      allowedLeagueIds === null || allowedLeagueIds.has(match.league_id),
  );

  if (matches.length === 0) {
    throw new Error('No matches found. Run scrape:calendar first.');
  }

  const candidates = selectResultCandidates(matches, leagues);

  console.warn(
    `Found ${candidates.length} recent played match candidate(s) from ${matches.length} match(es).`,
  );

  const { results, games, scraped, skipped } = await scrapeResults(candidates);

  await db.upsertMatchResults(results);
  await db.upsertMatchGames(games);

  console.warn(
    `Saved ${results.length} result(s) and ${games.length} game(s). Scraped ${scraped}, skipped ${skipped}.`,
  );
}

runScrapeScript(main);
