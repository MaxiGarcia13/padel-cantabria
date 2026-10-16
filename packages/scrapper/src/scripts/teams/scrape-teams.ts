import type { CategoryKey, Team } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { LEAGUE_TEAMS_URL } from '@/constants/urls.js';
import { parseTeamsTable } from './parse-teams-table.js';

const TEAMS_READY_TIMEOUT_MS = 30_000;

export async function scrapeTeams(categories: CategoryKey[]): Promise<Team[]> {
  if (categories.length === 0) {
    throw new Error('No categories found');
  }

  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const teams: Team[] = [];

    for (const category of categories) {
      teams.push(...(await scrapeCategoryTeams(page, category)));
    }

    return teams;
  } finally {
    await browser.close();
  }
}

async function scrapeCategoryTeams(
  page: Page,
  category: CategoryKey,
): Promise<Team[]> {
  const url = buildTeamsUrl(category);

  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await waitForTeamsReady(page);

  return parseTeamsTable(page, category);
}

function buildTeamsUrl(category: CategoryKey): string {
  const params = new URLSearchParams({
    Id: String(category.league_id),
    genero: category.gender,
    grupo: category.category,
  });

  return `${LEAGUE_TEAMS_URL}?${params.toString()}`;
}

async function waitForTeamsReady(page: Page): Promise<void> {
  await page.waitForFunction(
    () => {
      const mandando = document.getElementById('mandando');

      if (mandando && mandando.style.display !== 'none') {
        return false;
      }

      const table = Array.from(document.querySelectorAll('table')).find(
        (candidate) =>
          candidate.textContent?.includes('Nombre del Equipo') ?? false,
      );

      if (!table) {
        return false;
      }

      const hasTeams = table.querySelector('tr.lineas a[href*="IdEquipo="]');
      const isEmpty = table.textContent?.includes(
        'ningún equipo inscrito',
      ) || table.textContent?.includes('ningun equipo inscrito');

      return Boolean(hasTeams || isEmpty);
    },
    { timeout: TEAMS_READY_TIMEOUT_MS },
  );
}
