import type { League } from '@padel-cantabria/database';
import {
  getPhaseOptions,
  resolveCompetitionLabels,
} from '@padel-cantabria/shared';

export function presentCompetitionLabels(
  leagues: League[],
  leagueId: number,
  gender: string,
  phase: string,
  category: string,
) {
  const labels = resolveCompetitionLabels(leagues, {
    leagueId,
    gender,
    phase,
    category,
  });

  return {
    league: labels.leagueName,
    gender: labels.genderLabel,
    gender_code: labels.genderCode,
    phase: labels.phaseLabel,
    phase_value: labels.phaseValue,
    category: labels.categoryLabel,
    category_value: labels.categoryValue,
  };
}

export function presentPhaseOptions(
  leagues: League[],
  leagueId: number,
  gender: string,
  phaseValues: string[],
) {
  return getPhaseOptions(leagues, leagueId, gender, phaseValues).map(
    (option) => ({
      phase: option.label,
      phase_value: option.value,
    }),
  );
}
