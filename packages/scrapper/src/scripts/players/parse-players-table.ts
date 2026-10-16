import type { Page } from 'puppeteer';
import type { RawPlayerRow, ScrapedPlayer } from './types.js';

function parseInteger(value: string | null | undefined): number | null {
  const trimmed = value?.trim() ?? '';

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}

function joinSurnames(
  surname1: string | null | undefined,
  surname2: string | null | undefined,
): string {
  return [surname1, surname2]
    .map((part) => part?.trim() ?? '')
    .filter((part) => part.length > 0)
    .join(' ');
}

export async function parsePlayersTable(page: Page): Promise<ScrapedPlayer[]> {
  const browserRows = await page.evaluate((): RawPlayerRow[] => {
    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate.textContent?.includes('Apellido 1') ?? false,
    );

    if (!table) {
      return [];
    }

    const rows: RawPlayerRow[] = [];

    for (const row of table.querySelectorAll('tr')) {
      const cells = Array.from(row.querySelectorAll('td'));

      if (cells.length < 6) {
        continue;
      }

      rows.push({
        position: cells[0]?.textContent ?? null,
        surname1: cells[1]?.textContent ?? null,
        surname2: cells[2]?.textContent ?? null,
        name: cells[3]?.textContent ?? null,
        points: cells[5]?.textContent ?? null,
      });
    }

    return rows;
  });

  return browserRows.flatMap((browserRow) => {
    const position = parseInteger(browserRow.position);
    const points = parseInteger(browserRow.points);
    const surname = joinSurnames(browserRow.surname1, browserRow.surname2);
    const name = browserRow.name?.trim() ?? '';

    if (position === null || points === null || !surname || !name) {
      return [];
    }

    return [
      {
        position,
        surname,
        name,
        points,
      },
    ];
  });
}
