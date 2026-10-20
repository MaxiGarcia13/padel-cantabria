import type { Gender, League, SelectOption } from '@padel-cantabria/database';

export interface CompetitionKey {
  leagueId: number;
  gender: string;
  phase: string;
  category: string;
}

export interface CompetitionLabels {
  leagueName: string;
  genderLabel: string;
  phaseLabel: string;
  categoryLabel: string;
  genderCode: string;
  phaseValue: string;
  categoryValue: string;
}

export function findLeagueGender(
  leagues: League[] | undefined,
  leagueId: number,
  gender: string,
): {
  league: League | undefined;
  gender: Gender | undefined;
} {
  const league = leagues?.find((entry) => entry.league_id === leagueId);
  const genderNode = league?.genders.find((entry) => entry.value === gender);

  return { league, gender: genderNode };
}

export function resolveCompetitionLabels(
  leagues: League[] | undefined,
  {
    leagueId,
    gender,
    phase,
    category,
  }: CompetitionKey,
): CompetitionLabels {
  const { league, gender: genderNode } = findLeagueGender(
    leagues,
    leagueId,
    gender,
  );
  const phaseNode = genderNode?.phases.find((entry) => entry.value === phase);
  const categoryNode = phaseNode?.categories.find(
    (entry) => entry.value === category,
  );

  return {
    leagueName: league?.name ?? String(leagueId),
    genderLabel: genderNode?.label ?? gender,
    phaseLabel: phaseNode?.label ?? phase,
    categoryLabel: categoryNode?.label ?? category,
    genderCode: gender,
    phaseValue: phase,
    categoryValue: category,
  };
}

export function getPhaseOptions(
  leagues: League[] | undefined,
  leagueId: number,
  gender: string,
  phaseValues: string[],
): SelectOption[] {
  const { gender: genderNode } = findLeagueGender(leagues, leagueId, gender);
  const phaseLabels = new Map(
    (genderNode?.phases ?? []).map((entry) => [entry.value, entry.label]),
  );

  return phaseValues.map((value) => ({
    value,
    label: phaseLabels.get(value) ?? value,
  }));
}
