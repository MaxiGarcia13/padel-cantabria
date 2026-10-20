import type { League } from '@padel-cantabria/database';

export function presentLeagues(leagues: League[]) {
  return leagues.map((league) => ({
    league: league.name,
    genders: league.genders.map((gender) => ({
      gender: gender.label,
      gender_code: gender.value,
      phases: gender.phases.map((phase) => ({
        phase: phase.label,
        phase_value: phase.value,
        categories: phase.categories.map((category) => ({
          category: category.label,
          category_value: category.value,
        })),
      })),
    })),
  }));
}
