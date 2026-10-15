import type {
  BaseLeague,
  Gender,
  League,
  Phase,
  SelectOption,
} from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import puppeteer from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import { isActiveLeague } from './is-active-league.js';
import { scrapeBaseLeagues } from './scrape-league.js';

const PHASE_PLACEHOLDERS = ['0'];
const CATEGORY_PLACEHOLDERS = ['-'];
const SELECT_OPTIONS_TIMEOUT_MS = 10_000;

export async function scrapeLeagues(): Promise<League[]> {
  const baseLeagues = (await scrapeBaseLeagues()).filter((league) =>
    isActiveLeague(league),
  );
  const browser = await puppeteer.launch({ headless: true });

  try {
    const page = await browser.newPage();
    const leagues: League[] = [];

    for (const baseLeague of baseLeagues) {
      leagues.push(await scrapeLeague(page, baseLeague));
    }

    return leagues;
  } finally {
    await browser.close();
  }
}

async function scrapeLeague(
  page: Page,
  baseLeague: BaseLeague,
): Promise<League> {
  await page.goto(`${LEAGUE_CALENDAR_URL}?id=${baseLeague.league_id}`, {
    waitUntil: 'domcontentloaded',
  });
  await page.waitForSelector('#genero');

  const genderOptions = await readSelectOptions(page, '#genero', []);
  const genders: Gender[] = [];

  for (const gender of genderOptions) {
    await triggerSelectReload(
      page,
      'genero',
      gender.value,
      'cargargenero',
      '#fase',
      PHASE_PLACEHOLDERS,
    );

    const phaseOptions = await readSelectOptions(
      page,
      '#fase',
      PHASE_PLACEHOLDERS,
    );
    const phases: Phase[] = [];

    for (const phase of phaseOptions) {
      await triggerSelectReload(
        page,
        'fase',
        phase.value,
        'cargarfase',
        '#grupo',
        CATEGORY_PLACEHOLDERS,
      );

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
    ...baseLeague,
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

async function waitForSelectOptions(
  page: Page,
  selector: string,
  placeholders: string[],
): Promise<void> {
  try {
    await page.waitForFunction(
      (selectSelector, placeholderValues) => {
        const select = document.querySelector<HTMLSelectElement>(selectSelector);

        if (!select) {
          return false;
        }

        return Array.from(select.options).some((option) => {
          const label = option.textContent?.trim() ?? '';

          return (
            option.value.length > 0
            && label.length > 0
            && !placeholderValues.includes(option.value)
          );
        });
      },
      { timeout: SELECT_OPTIONS_TIMEOUT_MS },
      selector,
      placeholders,
    );
  } catch {
    // Select may legitimately have no options after reload.
  }
}

async function triggerSelectReload(
  page: Page,
  selectId: string,
  value: string,
  reloadFnName: 'cargargenero' | 'cargarfase',
  dependentSelector: string,
  dependentPlaceholders: string[],
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

  await waitForSelectOptions(page, dependentSelector, dependentPlaceholders);
}
