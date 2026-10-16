import type { CategoryKey, Team } from '@padel-cantabria/database';
import type { Page } from 'puppeteer';
import type { RawTeam } from './types.js';
import { EMPTY_TEAM_STANDINGS } from '@padel-cantabria/database';

export async function parseTeamsTable(
  page: Page,
  category: CategoryKey,
): Promise<Team[]> {
  const rawTeams = await page.evaluate((): RawTeam[] => {
    const table = Array.from(document.querySelectorAll('table')).find(
      (candidate) =>
        candidate.textContent?.includes('Nombre del Equipo') ?? false,
    );

    if (!table) {
      return [];
    }

    const teams: RawTeam[] = [];

    for (const row of table.querySelectorAll('tr.lineas')) {
      const detailLink = Array.from(row.querySelectorAll('a')).find((link) =>
        (link.getAttribute('href') ?? '').includes('IdEquipo='),
      );

      if (!detailLink) {
        continue;
      }

      const href = detailLink.getAttribute('href') ?? '';
      const idMatch = href.match(/IdEquipo=(\d+)/);
      const name = detailLink.textContent?.trim() ?? null;

      teams.push({
        id: idMatch ? Number(idMatch[1]) : null,
        name,
      });
    }

    return teams;
  });

  return rawTeams.flatMap((raw) => {
    if (raw.id === null || !raw.name) {
      return [];
    }

    return [
      {
        id: raw.id,
        league_id: category.league_id,
        gender: category.gender,
        category: category.category,
        name: raw.name,
        ...EMPTY_TEAM_STANDINGS,
      },
    ];
  });
}
