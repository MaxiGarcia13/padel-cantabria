import type { CategoryMatch } from '@padel-cantabria/database';

/**
 * Prefer labels for display. Keep `*_value` / `gender_code` for follow-up tools
 * (list_teams, get_top_players, get_team_overview).
 */
export function presentCategory(category: CategoryMatch) {
  return {
    league: category.league_name,
    gender: category.gender_label,
    gender_code: category.gender,
    phase: category.phase_label,
    phase_value: category.phase,
    category: category.category_label,
    category_value: category.category,
  };
}

export function presentCategories(categories: CategoryMatch[]) {
  return categories.map(presentCategory);
}
