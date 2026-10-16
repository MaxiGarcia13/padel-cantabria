import type { CategoryKey } from '@padel-cantabria/database';

export function parseCategoryParams(params: {
  league?: string;
  gender?: string;
  phase?: string;
  category?: string;
}): CategoryKey | null {
  const leagueId = Number(params.league);

  if (
    !Number.isFinite(leagueId)
    || !params.gender
    || !params.phase
    || !params.category
  ) {
    return null;
  }

  return {
    league_id: leagueId,
    gender_value: params.gender,
    phase_value: params.phase,
    category_value: params.category,
  };
}

export function buildCategoryPath(category: CategoryKey): string {
  return [
    '',
    category.league_id,
    category.gender_value,
    category.phase_value,
    category.category_value,
  ]
    .map((segment) => encodeURIComponent(String(segment)))
    .join('/');
}
