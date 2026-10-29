import process from 'node:process';
import {
  createScraperClientFromEnv,
  parseLeagueIds,
} from '@padel-cantabria/database';
import { runScrapeScript } from '@/run-scrape-script.js';
import { parseGenders } from '../league/parse-genders.js';
import { scrapePlayers } from './scrape-players.js';

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
  const teams = await db.getTeams({ leagueIds, genders });

  if (teams.length === 0) {
    throw new Error(
      genders === null
        ? 'No teams found. Run scrape:teams first.'
        : 'No teams found for SCRAPE_GENDERS. Check the value or run scrape:teams first.',
    );
  }

  const previousPlayers = await db.getTeamPlayers();
  const players = await scrapePlayers(teams, previousPlayers);

  await db.upsertTeamPlayers(players);

  console.warn(
    `Saved ${players.length} player(s) from ${teams.length} team(s).`,
  );
}

runScrapeScript(main);
