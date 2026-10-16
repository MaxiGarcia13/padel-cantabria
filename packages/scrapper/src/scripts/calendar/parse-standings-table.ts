import type { Page } from 'puppeteer';
import type { RawStandingRow, ScrapedTeamStanding } from './types.js';

export async function parseStandingsTable(
  page: Page,
): Promise<ScrapedTeamStanding[]> {
  const rawRows = await page.evaluate((): RawStandingRow[] => {
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

    function parseInteger(value: string | null | undefined): number | null {
      const trimmed = value?.trim() ?? '';

      if (trimmed.length === 0) {
        return null;
      }

      const parsed = Number(trimmed);

      return Number.isFinite(parsed) ? parsed : null;
    }

    const rows: RawStandingRow[] = [];

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
        id: idMatch ? Number(idMatch[1]) : null,
        name: detailLink.textContent?.trim() || null,
        position: parseInteger(cells[0]?.textContent),
        confrontations_played: parseInteger(cells[2]?.textContent),
        points: parseInteger(cells[3]?.textContent),
        matches_played: parseInteger(cells[4]?.textContent),
        matches_won: parseInteger(cells[5]?.textContent),
        sets_for: parseInteger(cells[6]?.textContent),
        sets_against: parseInteger(cells[7]?.textContent),
        sets_average: parseInteger(cells[8]?.textContent),
        games_for: parseInteger(cells[9]?.textContent),
        games_against: parseInteger(cells[10]?.textContent),
        games_average: parseInteger(cells[11]?.textContent),
      });
    }

    return rows;
  });

  return rawRows.flatMap((raw) => {
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
