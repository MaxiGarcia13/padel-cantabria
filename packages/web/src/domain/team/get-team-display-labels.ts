import type { League, SelectOption, Team } from '@padel-cantabria/database';

export interface TeamDisplayLabels {
  genderLabel: string;
  categoryLabel: string;
}

export function getTeamDisplayLabels(
  leagues: League[] | undefined,
  team: Team,
): TeamDisplayLabels {
  const league = leagues?.find(
    (entry) => entry.league_id === team.league_id,
  );
  const gender = league?.genders.find(
    (entry) => entry.value === team.gender,
  );

  let categoryLabel = team.category;

  for (const phase of gender?.phases ?? []) {
    const category = phase.categories.find(
      (entry) => entry.value === team.category,
    );

    if (category) {
      categoryLabel = category.label;
      break;
    }
  }

  return {
    genderLabel: gender?.label ?? team.gender,
    categoryLabel,
  };
}

export function getPhaseOptions(
  leagues: League[] | undefined,
  team: Team,
  phases: string[],
): SelectOption[] {
  const league = leagues?.find(
    (entry) => entry.league_id === team.league_id,
  );
  const gender = league?.genders.find(
    (entry) => entry.value === team.gender,
  );
  const phaseLabels = new Map(
    (gender?.phases ?? []).map((phase) => [phase.value, phase.label]),
  );

  return phases.map((phase) => ({
    value: phase,
    label: phaseLabels.get(phase) ?? phase,
  }));
}
