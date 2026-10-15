import type { Page } from 'puppeteer';
import type {
  CalendarGender,
  CalendarLeague,
  CalendarPhase,
  League,
  SelectOption,
} from './types.js';
import puppeteer from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { scrapeLeagues } from './scrape-league.js';

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

  const genderOptions = await readSelectOptions(page, '#genero', []);
  const genders: CalendarGender[] = [];

  for (const gender of genderOptions) {
    await triggerSelectReload(page, 'genero', gender.value, 'cargargenero');

    const phaseOptions = await readSelectOptions(
      page,
      '#fase',
      PHASE_PLACEHOLDERS,
    );
    const phases: CalendarPhase[] = [];

    for (const phase of phaseOptions) {
      await triggerSelectReload(page, 'fase', phase.value, 'cargarfase');

      const categories = await readSelectOptions(
        page,
        '#grupo',
        CATEGORY_PLACEHOLDERS,
      );

      phases.push({
        ...phase,
        categories,
      });
    }

    genders.push({
      ...gender,
      phases,
    });
  }

  return {
    ...league,
    genders,
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
