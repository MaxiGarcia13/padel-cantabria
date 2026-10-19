import type { CategoryKey } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type {
  RawCalendarCell,
  RawCalendarMatch,
  ScrapedCalendarMatch,
} from './types.js';
import { parseMatchCellDetails } from './parse-match-cell-details.js';

export async function parseCalendarTable(
  page: Page,
  category: CategoryKey,
): Promise<ScrapedCalendarMatch[]> {
  const rawCells = await page.evaluate((): RawCalendarCell[] => {
    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate
          .querySelector('td.estiloequipos')
          ?.textContent
          ?.includes('Local'),
    );

    if (!table) {
      return [];
    }

    const rows = Array.from(table.querySelectorAll('tr'));

    if (rows.length < 2) {
      return [];
    }

    const headerCells = Array.from(rows[0]!.querySelectorAll('td'));
    const awayTeams = headerCells
      .slice(1)
      .map((cell) => cell.textContent?.trim() ?? '');

    const cells: RawCalendarCell[] = [];

    for (const row of rows.slice(1)) {
      const rowCells = Array.from(row.querySelectorAll('td'));
      const homeTeam = rowCells[0]?.textContent?.trim() ?? null;

      for (let columnIndex = 1; columnIndex < rowCells.length; columnIndex += 1) {
        const cell = rowCells[columnIndex]!;

        if (cell.classList.contains('nulo')) {
          continue;
        }

        const link
          = cell.querySelector('a[href*="Liga_AccesoHorario"]')
            ?? cell.querySelector('a');

        if (!link) {
          continue;
        }

        const href = link.getAttribute('href') ?? '';
        const idMatch = href.match(/partido=(\d+)/);

        if (!idMatch) {
          continue;
        }

        const status
          = Array.from(cell.classList).find((className) => className.length > 0)
            ?? null;

        const lines = (link.textContent ?? '')
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0);

        cells.push({
          id: Number(idMatch[1]),
          home_team: homeTeam,
          away_team: awayTeams[columnIndex - 1] || null,
          status,
          lines,
        });
      }
    }

    return cells;
  });

  const rawMatches: RawCalendarMatch[] = rawCells.map((cell) => {
    const details = parseMatchCellDetails(cell.status, cell.lines);

    return {
      id: cell.id,
      home_team: cell.home_team,
      away_team: cell.away_team,
      status: cell.status,
      date: details.date,
      location: details.location,
      rounds: details.rounds,
    };
  });

  return rawMatches.flatMap((raw) => {
    if (
      raw.id === null
      || !raw.home_team
      || !raw.away_team
      || !raw.date
    ) {
      return [];
    }

    return [
      {
        ...category,
        id: raw.id,
        home_team: raw.home_team,
        away_team: raw.away_team,
        date: raw.date,
        status: raw.status,
        location: raw.location,
        rounds: raw.rounds,
      },
    ];
  });
}
