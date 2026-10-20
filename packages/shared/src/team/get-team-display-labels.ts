import type { League, Team } from '@padel-cantabria/database';
import { findLeagueGender } from './resolve-competition-labels.js';

export interface TeamDisplayLabels {
  genderLabel: string;
  categoryLabel: string;
}

export function getTeamDisplayLabels(
  leagues: League[] | undefined,
  team: Team,
): TeamDisplayLabels {
  const { gender } = findLeagueGender(leagues, team.league_id, team.gender);

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
