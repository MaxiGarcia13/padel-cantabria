import process from 'node:process';
import { createDbClient } from '@/create-db-client.js';
import { parseLeagueIds } from '../league/parse-league-ids.js';
import { scrapePlayers } from './scrape-players.js';

async function main(): Promise<void> {
  const db = createDbClient();
  const allowedLeagueIds = parseLeagueIds(process.env.LEAGUE_IDS);
  const teams = (await db.getTeams()).filter(
    (team) =>
      allowedLeagueIds === null || allowedLeagueIds.has(team.league_id),
  );

  if (teams.length === 0) {
    throw new Error('No teams found. Run scrape:teams first.');
  }

  const previousPlayers = await db.getTeamPlayers();
  const players = await scrapePlayers(teams, previousPlayers);

  await db.upsertTeamPlayers(players);

  console.warn(
    `Saved ${players.length} player(s) from ${teams.length} team(s).`,
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
