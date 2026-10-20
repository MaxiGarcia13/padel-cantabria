import type { Team, TeamPlayer } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import { LEAGUE_TEAM_DETAIL_URL } from '@/constants/urls.js';
import { waitForFederationReady } from '@/wait-for-federation-ready.js';
import {
  forEachWithRequestDelay,
  withBrowserPage,
} from '@/with-browser-page.js';
import { mergeTeamPlayers } from './merge-team-players.js';
import { parsePlayersTable } from './parse-players-table.js';
import { playerKey } from './player-key.js';

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

  return withBrowserPage(async (page) => {
    const players: TeamPlayer[] = [];

    await forEachWithRequestDelay(teams, async (team) => {
      players.push(
        ...(await scrapeTeamPlayers(page, team, previousByKey)),
      );
    });

    return players;
  });
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
  await waitForFederationReady(page, () => {
    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate.textContent?.includes('Apellido 1') ?? false,
    );

    return Boolean(table);
  });
}
