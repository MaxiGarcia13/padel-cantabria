import type { Connection } from '@tursodatabase/serverless';
import type { Gender, League, Phase, SelectOption } from '../types/league.js';

interface LeagueRecord {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

type GenderRecord = SelectOption & {
  league_id: number;
};

type PhaseRecord = SelectOption & {
  league_id: number;
  gender_value: string;
};

type CategoryRecord = SelectOption & {
  league_id: number;
  gender_value: string;
  phase_value: string;
};

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

export async function getLeagues(connection: Connection): Promise<League[]> {
  const [leagueResult, genderResult, phaseResult, categoryResult]
    = await connection.batch(
      [
        'SELECT id, name, start_date, end_date FROM leagues ORDER BY start_date DESC',
        'SELECT league_id, value, label FROM genders',
        'SELECT league_id, gender_value, value, label FROM phases',
        'SELECT league_id, gender_value, phase_value, value, label FROM categories',
      ],
      'read',
    );

  const leagueRows = leagueResult.rows as LeagueRecord[];
  const genderRows = genderResult.rows as GenderRecord[];
  const phaseRows = phaseResult.rows as PhaseRecord[];
  const categoryRows = categoryResult.rows as CategoryRecord[];

  const categoriesByPhase = new Map<string, SelectOption[]>();
  for (const row of categoryRows) {
    const key = categoryKey(row.league_id, row.gender_value, row.phase_value);
    const categories = categoriesByPhase.get(key) ?? [];
    categories.push({ value: row.value, label: row.label });
    categoriesByPhase.set(key, categories);
  }

  const phasesByGender = new Map<string, Phase[]>();
  for (const row of phaseRows) {
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
  for (const row of genderRows) {
    const genders = gendersByLeague.get(row.league_id) ?? [];
    genders.push({
      value: row.value,
      label: row.label,
      phases: phasesByGender.get(phaseKey(row.league_id, row.value)) ?? [],
    });
    gendersByLeague.set(row.league_id, genders);
  }

  return leagueRows.map(
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
