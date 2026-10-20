import type { League } from '@padel-cantabria/database';
import process from 'node:process';
import { parseLeagueIds } from '@padel-cantabria/database';
import { withBrowserPage } from '@/with-browser-page.js';
import { scrapeLeague } from './scrape-league-tree.js';
import { scrapeBaseLeagues } from './scrape-league.js';

export async function scrapeLeagues(): Promise<League[]> {
  const leagues = await scrapeBaseLeagues();

  if (leagues.length === 0) {
    throw new Error('No leagues found');
  }

  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const filteredLeagues = leagues.filter(
    (league) =>
      allowedLeagueIds === null || allowedLeagueIds.has(league.league_id),
  );

  if (filteredLeagues.length === 0) {
    throw new Error('No leagues found');
  }

  return withBrowserPage(async (page) => {
    const result: League[] = [];

    for (const baseLeague of filteredLeagues) {
      result.push(await scrapeLeague(page, baseLeague));
    }

    return result;
  });
}
