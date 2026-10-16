import type { CategoryKey, MatchWrite, Team } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type { ScrapedCalendarMatch } from './types.js';
import puppeteer from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { parseCalendarTable } from './parse-calendar-table.js';
import { resolveMatchTeams } from './resolve-match-teams.js';

const CALENDAR_READY_TIMEOUT_MS = 30_000;

export async function scrapeCalendars(
  categories: CategoryKey[],
  teams: Team[],
): Promise<MatchWrite[]> {
  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  if (teams.length === 0) {
    throw new Error('No teams found');
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const scrapedMatches: ScrapedCalendarMatch[] = [];

    for (const category of categories) {
      scrapedMatches.push(...(await scrapeCategoryCalendar(page, category)));
    }

    return resolveMatchTeams(scrapedMatches, teams);
  } finally {
    await browser.close();
  }
}

async function scrapeCategoryCalendar(
  page: Page,
  category: CategoryKey,
): Promise<ScrapedCalendarMatch[]> {
  const url = buildCalendarUrl(category);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForCalendarReady(page);

  return parseCalendarTable(page, category);
}

function buildCalendarUrl(category: CategoryKey): string {
  const params = new URLSearchParams({
    id: String(category.league_id),
    genero: category.gender,
    fase: category.phase,
    grupo: category.category,
  });

  return `${LEAGUE_CALENDAR_URL}?${params.toString()}`;
}

async function waitForCalendarReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
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
    },
    { timeout: CALENDAR_READY_TIMEOUT_MS },
  );
}
