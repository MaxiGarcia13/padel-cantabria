import type { BaseLeague, Gender, League, Phase } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import { LEAGUE_CALENDAR_URL } from '@/constants/urls.js';
import {
  CATEGORY_PLACEHOLDERS,
  PHASE_PLACEHOLDERS,
  readSelectOptions,
  triggerSelectReload,
} from './calendar-select.js';

export async function scrapeLeague(
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
