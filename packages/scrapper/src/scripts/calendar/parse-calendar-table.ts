import type { CategoryKey } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type { RawCalendarMatch, ScrapedCalendarMatch } from './types.js';

export async function parseCalendarTable(
  page: Page,
  category: CategoryKey,
): Promise<ScrapedCalendarMatch[]> {
  const rawMatches = await page.evaluate((): RawCalendarMatch[] => {
    const table = Array.from(document.querySelectorAll('table')).find((candidate) =>
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

    const matches: RawCalendarMatch[] = [];

    for (const row of rows.slice(1)) {
      const cells = Array.from(row.querySelectorAll('td'));
      const homeTeam = cells[0]?.textContent?.trim() ?? null;

      for (let columnIndex = 1; columnIndex < cells.length; columnIndex += 1) {
        const cell = cells[columnIndex]!;

        if (cell.classList.contains('nulo')) {
          continue;
        }

        const link = cell.querySelector('a');

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

        matches.push({
          id: Number(idMatch[1]),
          home_team: homeTeam,
          away_team: awayTeams[columnIndex - 1] || null,
          date: link.textContent?.trim() || null,
          status,
          location: null,
          rounds: null,
        });
      }
    }

    return matches;
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
