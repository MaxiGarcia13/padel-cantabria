import type {
  CategoryRecord,
  GenderRecord,
  LeagueRecord,
  PhaseRecord,
} from '../types/db.js';
import type { Gender, League, Phase, SelectOption } from '../types/league.js';

export interface LeagueRecords {
  leagues: LeagueRecord[];
  genders: GenderRecord[];
  phases: PhaseRecord[];
  categories: CategoryRecord[];
}

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

function groupCategoriesByPhase(
  categories: CategoryRecord[],
): Map<string, SelectOption[]> {
  const categoriesByPhase = new Map<string, SelectOption[]>();

  for (const row of categories) {
    const key = categoryKey(row.league_id, row.gender_value, row.phase_value);
    const categoryOptions = categoriesByPhase.get(key) ?? [];
    categoryOptions.push({ value: row.value, label: row.label });
    categoriesByPhase.set(key, categoryOptions);
  }

  return categoriesByPhase;
}

function groupPhasesByGender(
  phases: PhaseRecord[],
  categoriesByPhase: Map<string, SelectOption[]>,
): Map<string, Phase[]> {
  const phasesByGender = new Map<string, Phase[]>();

  for (const row of phases) {
    const key = phaseKey(row.league_id, row.gender_value);
    const phaseOptions = phasesByGender.get(key) ?? [];
    phaseOptions.push({
      value: row.value,
      label: row.label,
      categories:
        categoriesByPhase.get(
          categoryKey(row.league_id, row.gender_value, row.value),
        ) ?? [],
    });
    phasesByGender.set(key, phaseOptions);
  }

  return phasesByGender;
}

function groupGendersByLeague(
  genders: GenderRecord[],
  phasesByGender: Map<string, Phase[]>,
): Map<number, Gender[]> {
  const gendersByLeague = new Map<number, Gender[]>();

  for (const row of genders) {
    const genderOptions = gendersByLeague.get(row.league_id) ?? [];
    genderOptions.push({
      value: row.value,
      label: row.label,
      phases: phasesByGender.get(phaseKey(row.league_id, row.value)) ?? [],
    });
    gendersByLeague.set(row.league_id, genderOptions);
  }

  return gendersByLeague;
}

export function assembleLeagues({
  leagues,
  genders,
  phases,
  categories,
}: LeagueRecords): League[] {
  const categoriesByPhase = groupCategoriesByPhase(categories);
  const phasesByGender = groupPhasesByGender(phases, categoriesByPhase);
  const gendersByLeague = groupGendersByLeague(genders, phasesByGender);

  return leagues.map(
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
