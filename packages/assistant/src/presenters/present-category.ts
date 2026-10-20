import type { CategoryMatch } from '@padel-cantabria/database';

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
