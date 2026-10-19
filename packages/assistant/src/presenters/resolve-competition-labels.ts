import type { League } from '@padel-cantabria/database';

export function resolveCompetitionLabels(
  leagues: League[],
  leagueId: number,
  gender: string,
  phase: string,
  category: string,
) {
  const league = leagues.find((item) => item.league_id === leagueId);
  const genderNode = league?.genders.find((item) => item.value === gender);
  const phaseNode = genderNode?.phases.find((item) => item.value === phase);
  const categoryNode = phaseNode?.categories.find(
    (item) => item.value === category,
  );

  return {
    league: league?.name ?? String(leagueId),
    gender: genderNode?.label ?? gender,
    phase: phaseNode?.label ?? phase,
    category: categoryNode?.label ?? category,
    genderCode: gender,
    phaseValue: phase,
    categoryValue: category,
  };
}

export function presentPhaseOptions(
  leagues: League[],
  leagueId: number,
  gender: string,
  phaseValues: string[],
) {
  const league = leagues.find((item) => item.league_id === leagueId);
  const genderNode = league?.genders.find((item) => item.value === gender);

  return phaseValues.map((value) => {
    const phaseNode = genderNode?.phases.find((item) => item.value === value);
    return {
      phase: phaseNode?.label ?? value,
      phase_value: value,
    };
  });
}
