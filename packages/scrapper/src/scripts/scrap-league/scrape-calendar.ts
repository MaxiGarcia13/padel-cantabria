import type { Page } from 'puppeteer';
import type { CalendarLeague, League, SelectOption } from './types.js';
import puppeteer from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { scrapeLeagues } from './scrape.js';
import { mergeSelectOptions } from './utils.js';

const PHASE_PLACEHOLDERS = ['0'];
const CATEGORY_PLACEHOLDERS = ['-'];

export async function scrapeCalendar(): Promise<CalendarLeague[]> {
  const leagues = await scrapeLeagues();
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const calendarLeagues: CalendarLeague[] = [];

    for (const league of leagues) {
      calendarLeagues.push(await scrapeCalendarForLeague(page, league));
    }

    return calendarLeagues;
  } finally {
    await browser.close();
  }
}

async function scrapeCalendarForLeague(
  page: Page,
  league: League,
): Promise<CalendarLeague> {
  await page.goto(`${LEAGUE_CALENDAR_URL}?id=${league.league_id}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('#genero');

  const genders = await readSelectOptions(page, '#genero', []);
  const phases: SelectOption[] = [];
  const categories: SelectOption[] = [];

  for (const gender of genders) {
    await triggerSelectReload(page, 'genero', gender.value, 'cargargenero');

    const genderPhases = await readSelectOptions(
      page,
      '#fase',
      PHASE_PLACEHOLDERS,
    );
    phases.push(...genderPhases);

    for (const phase of genderPhases) {
      await triggerSelectReload(page, 'fase', phase.value, 'cargarfase');

      const phaseCategories = await readSelectOptions(
        page,
        '#grupo',
        CATEGORY_PLACEHOLDERS,
      );
      categories.push(...phaseCategories);
    }
  }

  return {
    ...league,
    genders,
    phases: mergeSelectOptions(phases),
    categories: mergeSelectOptions(categories),
  };
}

async function readSelectOptions(
  page: Page,
  selector: string,
  placeholders: string[],
): Promise<SelectOption[]> {
  return page.evaluate(
    (selectSelector, placeholderValues) => {
      const select = document.querySelector<HTMLSelectElement>(selectSelector);

      if (!select) {
        return [];
      }

      return Array.from(select.options)
        .map((option) => ({
          value: option.value,
          label: option.textContent?.trim() ?? '',
        }))
        .filter(
          (option) =>
            option.value.length > 0
            && option.label.length > 0
            && !placeholderValues.includes(option.value),
        );
    },
    selector,
    placeholders,
  );
}

async function triggerSelectReload(
  page: Page,
  selectId: string,
  value: string,
  reloadFnName: 'cargargenero' | 'cargarfase',
): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('Liga_Calendario') && response.ok(),
    { timeout: 30_000 },
  );

  await page.evaluate(
    (id, nextValue, fnName) => {
      const select = document.querySelector<HTMLSelectElement>(`#${id}`);

      if (!select) {
        throw new Error(`Select #${id} not found`);
      }

      select.value = nextValue;

      const reloadFn = (window as unknown as Record<string, () => void>)[fnName];

      if (typeof reloadFn !== 'function') {
        throw new TypeError(`${fnName} is not available`);
      }

      reloadFn();
    },
    selectId,
    value,
    reloadFnName,
  );

  await responsePromise;

  await page.waitForFunction(() => {
    const mandando = document.getElementById('mandando');
    return !mandando || mandando.style.display === 'none';
  });
}
