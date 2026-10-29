import type { Page } from 'puppeteer';
import type { RawStandingRow, ScrapedTeamStanding } from './types.js';
import { parseInteger } from '@/parse-integer.js';

export async function parseStandingsTable(
  page: Page,
): Promise<ScrapedTeamStanding[]> {
  const browserRows = await page.evaluate(() => {
    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate
          .querySelector('tr.fondoFCP')
          ?.textContent
          ?.includes('Posición') ?? false,
    );

    if (!table) {
      return [];
    }

    const rows = [];

    for (const row of table.querySelectorAll('tr.lineas')) {
      const cells = Array.from(row.querySelectorAll('td'));
      const detailLink = Array.from(row.querySelectorAll('a')).find((link) =>
        (link.getAttribute('href') ?? '').includes('IdEquipo='),
      );

      if (!detailLink || cells.length < 12) {
        continue;
      }

      const href = detailLink.getAttribute('href') ?? '';
      const idMatch = href.match(/IdEquipo=(\d+)/);

      rows.push({
        id: idMatch
          ? Number(idMatch[1])
          : null,
        name: detailLink.textContent?.trim() || null,
        position: cells[0]?.textContent ?? null,
        confrontations_played: cells[2]?.textContent ?? null,
        points: cells[3]?.textContent ?? null,
        matches_played: cells[4]?.textContent ?? null,
        matches_won: cells[5]?.textContent ?? null,
        sets_for: cells[6]?.textContent ?? null,
        sets_against: cells[7]?.textContent ?? null,
        sets_average: cells[8]?.textContent ?? null,
        games_for: cells[9]?.textContent ?? null,
        games_against: cells[10]?.textContent ?? null,
        games_average: cells[11]?.textContent ?? null,
      });
    }

    return rows;
  });

  return browserRows.flatMap((browserRow) => {
    const raw: RawStandingRow = {
      id: browserRow.id,
      name: browserRow.name,
      position: parseInteger(browserRow.position),
      confrontations_played: parseInteger(browserRow.confrontations_played),
      points: parseInteger(browserRow.points),
      matches_played: parseInteger(browserRow.matches_played),
      matches_won: parseInteger(browserRow.matches_won),
      sets_for: parseInteger(browserRow.sets_for),
      sets_against: parseInteger(browserRow.sets_against),
      sets_average: parseInteger(browserRow.sets_average),
      games_for: parseInteger(browserRow.games_for),
      games_against: parseInteger(browserRow.games_against),
      games_average: parseInteger(browserRow.games_average),
    };

    if (raw.id === null || !raw.name) {
      return [];
    }

    return [
      {
        id: raw.id,
        name: raw.name,
        position: raw.position,
        confrontations_played: raw.confrontations_played,
        points: raw.points,
        matches_played: raw.matches_played,
        matches_won: raw.matches_won,
        sets_for: raw.sets_for,
        sets_against: raw.sets_against,
        sets_average: raw.sets_average,
        games_for: raw.games_for,
        games_against: raw.games_against,
        games_average: raw.games_average,
      },
    ];
  });
}
