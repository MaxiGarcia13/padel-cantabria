import type {
  CategoryKey,
  MatchWrite,
  Team,
  TeamStanding,
} from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type { ScrapedCalendarMatch, ScrapedTeamStanding } from './types.js';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { delayBetweenRequests } from '@/delay.js';
import { launchBrowser } from '@/launch-browser.js';
import { waitForFederationReady } from '@/wait-for-federation-ready.js';
import { mergeTeamStandings } from './merge-team-standings.js';
import { parseCalendarTable } from './parse-calendar-table.js';
import { parseStandingsTable } from './parse-standings-table.js';
import { resolveMatchTeams } from './resolve-match-teams.js';

export interface ScrapeCalendarsResult {
  matches: MatchWrite[];
  standings: TeamStanding[];
}

export async function scrapeCalendars(
  categories: CategoryKey[],
  teams: Team[],
  previousPositions: Map<string, number | null>,
): Promise<ScrapeCalendarsResult> {
  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  if (teams.length === 0) {
    throw new Error('No teams found');
  }

  const browser = await launchBrowser();

  try {
    const page = await browser.newPage();
    const scrapedMatches: ScrapedCalendarMatch[] = [];
    const mergedStandings: TeamStanding[] = [];

    for (const [index, category] of categories.entries()) {
      if (index > 0) {
        await delayBetweenRequests();
      }

      const { matches, standings } = await scrapeCategoryCalendar(
        page,
        category,
      );

      scrapedMatches.push(...matches);
      mergedStandings.push(
        ...mergeTeamStandings(
          teams,
          category,
          standings,
          previousPositions,
        ),
      );
    }

    return {
      matches: resolveMatchTeams(scrapedMatches, teams),
      standings: mergedStandings,
    };
  } finally {
    await browser.close();
  }
}

async function scrapeCategoryCalendar(
  page: Page,
  category: CategoryKey,
): Promise<{
  matches: ScrapedCalendarMatch[];
  standings: ScrapedTeamStanding[];
}> {
  const url = buildCalendarUrl(category);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForCalendarReady(page);

  const [matches, standings] = await Promise.all([
    parseCalendarTable(page, category),
    parseStandingsTable(page),
  ]);

  return { matches, standings };
}

function buildCalendarUrl(category: CategoryKey): string {
  const params = new URLSearchParams({
    id: String(category.league_id),
    genero: category.gender,
    fase: category.phase,
    grupo: category.category,
    jornada: '--',
  });

  return `${LEAGUE_CALENDAR_URL}?${params.toString()}`;
}

async function waitForCalendarReady(page: Page): Promise<void> {
  await waitForFederationReady(page, () => {
    const mandando = document.getElementById('mandando');

    if (mandando && mandando.style.display !== 'none') {
      return false;
    }

    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate
          .querySelector('td.estiloequipos')
          ?.textContent
          ?.includes('Local'),
    );

    return Boolean(table && table.querySelectorAll('tr').length > 1);
  });
}
