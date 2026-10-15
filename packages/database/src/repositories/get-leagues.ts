import type { Connection } from '@tursodatabase/serverless';
import type { Gender, League, Phase, SelectOption } from '../types/league.js';
import { createConnection } from '../client.js';

function categoryKey(
  leagueId: number,
  genderValue: string,
  phaseValue: string,
): string {
  return `${leagueId}:${genderValue}:${phaseValue}`;
}

function phaseKey(leagueId: number, genderValue: string): string {
  return `${leagueId}:${genderValue}`;
}

export async function getLeagues(
  connection: Connection = createConnection(),
): Promise<League[]> {
  const [leagueResult, genderResult, phaseResult, categoryResult] =
    await connection.batch(
      [
        'SELECT id, name, start_date, end_date FROM leagues ORDER BY start_date DESC',
        'SELECT league_id, value, label FROM genders',
        'SELECT league_id, gender_value, value, label FROM phases',
        'SELECT league_id, gender_value, phase_value, value, label FROM categories',
      ],
      'read',
    );

  const categoriesByPhase = new Map<string, SelectOption[]>();
  for (const row of categoryResult.rows) {
    const key = categoryKey(row.league_id, row.gender_value, row.phase_value);
    const categories = categoriesByPhase.get(key) ?? [];
    categories.push({ value: row.value, label: row.label });
    categoriesByPhase.set(key, categories);
  }

  const phasesByGender = new Map<string, Phase[]>();
  for (const row of phaseResult.rows) {
    const key = phaseKey(row.league_id, row.gender_value);
    const phases = phasesByGender.get(key) ?? [];
    phases.push({
      value: row.value,
      label: row.label,
      categories:
        categoriesByPhase.get(
          categoryKey(row.league_id, row.gender_value, row.value),
        ) ?? [],
    });
    phasesByGender.set(key, phases);
  }

  const gendersByLeague = new Map<number, Gender[]>();
  for (const row of genderResult.rows) {
    const genders = gendersByLeague.get(row.league_id) ?? [];
    genders.push({
      value: row.value,
      label: row.label,
      phases: phasesByGender.get(phaseKey(row.league_id, row.value)) ?? [],
    });
    gendersByLeague.set(row.league_id, genders);
  }

  return leagueResult.rows.map(
    (row): League => ({
      league_id: row.id,
      name: row.name,
      schedule: {
        start_date: row.start_date,
        end_date: row.end_date,
      },
      genders: gendersByLeague.get(row.id) ?? [],
    }),
  );
}
