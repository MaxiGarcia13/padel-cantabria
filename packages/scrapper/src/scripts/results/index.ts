import process from 'node:process';
import {
  createScraperClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { parseGenders } from '../league/parse-genders.js';
import { scrapeResults } from './scrape-results.js';
import { selectResultCandidates } from './select-result-candidates.js';

async function main(): Promise<void> {
  const db = createScraperClientFromEnv();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const allowedGenders = parseGenders(process.env.SCRAPE_GENDERS);
  const leagueIds = allowedLeagueIds
    ? [...allowedLeagueIds]
    : null;
  const genders = allowedGenders
    ? [...allowedGenders]
    : null;

  const leagues = await db.getLeagues({ leagueIds });

  if (leagues.length === 0) {
    throw new Error('No leagues found. Run scrape:leagues first.');
  }

  const matches = await db.getAllMatches({ leagueIds, genders });

  if (matches.length === 0) {
    throw new Error(
      genders === null
        ? 'No matches found. Run scrape:calendar first.'
        : 'No matches found for SCRAPE_GENDERS. Check the value or run scrape:calendar first.',
    );
  }

  const candidates = selectResultCandidates(matches, leagues);

  console.warn(
    `Found ${candidates.length} recent played match candidate(s) from ${matches.length} match(es)${
      genders === null
        ? ''
        : ` (genders: ${genders.join(', ')})`
    }.`,
  );

  const { results, games, scraped, skipped } = await scrapeResults(candidates);

  await db.upsertMatchResults(results);
  await db.upsertMatchGames(games);

  console.warn(
    `Saved ${results.length} result(s) and ${games.length} game(s). Scraped ${scraped}, skipped ${skipped}.`,
  );
}

runScrapeScript(main);
