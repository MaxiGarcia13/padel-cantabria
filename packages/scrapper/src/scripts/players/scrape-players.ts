import type { Team, TeamPlayer } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import { LEAGUE_TEAM_DETAIL_URL } from '@/constants/urls.js';
import { launchBrowser } from '@/launch-browser.js';
import { mergeTeamPlayers } from './merge-team-players.js';
import { parsePlayersTable } from './parse-players-table.js';
import { playerKey } from './player-key.js';

const PLAYERS_READY_TIMEOUT_MS = 30_000;

export async function scrapePlayers(
  teams: Team[],
  previousPlayers: TeamPlayer[],
): Promise<TeamPlayer[]> {
  if (teams.length === 0) {
    throw new Error('No teams found');
  }

  const previousByKey = new Map(
    previousPlayers.map((player) => [
      playerKey(player.team_id, player.surname, player.name),
      { position: player.position, points: player.points },
    ]),
  );

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    const players: TeamPlayer[] = [];

    for (const team of teams) {
      players.push(
        ...(await scrapeTeamPlayers(page, team, previousByKey)),
      );
    }

    return players;
  } finally {
    await browser.close();
  }
}

async function scrapeTeamPlayers(
  page: Page,
  team: Team,
  previousByKey: Map<string, Pick<TeamPlayer, 'position' | 'points'>>,
): Promise<TeamPlayer[]> {
  const url = buildTeamDetailUrl(team);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForPlayersReady(page);

  const scraped = await parsePlayersTable(page);

  return mergeTeamPlayers(team.id, scraped, previousByKey);
}

function buildTeamDetailUrl(team: Team): string {
  const params = new URLSearchParams({
    IdEquipo: String(team.id),
    Id: String(team.league_id),
    grupo: team.category,
  });

  return `${LEAGUE_TEAM_DETAIL_URL}?${params.toString()}`;
}

async function waitForPlayersReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const mandando = document.getElementById('mandando');

      if (mandando && mandando.style.display !== 'none') {
        return false;
      }

      const table = Array.from(document.querySelectorAll('table')).find(
        (candidate) =>
          candidate.textContent?.includes('Apellido 1') ?? false,
      );

      return Boolean(table);
    },
    { timeout: PLAYERS_READY_TIMEOUT_MS },
  );
}
