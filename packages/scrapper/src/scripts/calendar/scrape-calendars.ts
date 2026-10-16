import type { CategoryKey, Match } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { parseCalendarTable } from './parse-calendar-table.js';

const CALENDAR_READY_TIMEOUT_MS = 30_000;

export async function scrapeCalendars(
  categories: CategoryKey[],
): Promise<Match[]> {
  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const matches: Match[] = [];

    for (const category of categories) {
      matches.push(...(await scrapeCategoryCalendar(page, category)));
    }

    return matches;
  } finally {
    await browser.close();
  }
}

async function scrapeCategoryCalendar(
  page: Page,
  category: CategoryKey,
): Promise<Match[]> {
  const url = buildCalendarUrl(category);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForCalendarReady(page);

  return parseCalendarTable(page, category);
}

function buildCalendarUrl(category: CategoryKey): string {
  const params = new URLSearchParams({
    id: String(category.league_id),
    genero: category.gender_value,
    fase: category.phase_value,
    grupo: category.category_value,
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
