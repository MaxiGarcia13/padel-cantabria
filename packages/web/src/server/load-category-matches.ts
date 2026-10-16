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
    gender: params.gender,
    phase: params.phase,
    category: params.category,
  };
}

export function buildCategoryPath(category: CategoryKey): string {
  return [
    '',
    'league',
    category.league_id,
    category.gender,
    category.phase,
    category.category,
  ]
    .map((segment) => encodeURIComponent(String(segment)))
    .join('/');
}

export function buildTeamPath(teamId: number): string {
  return `/team/${encodeURIComponent(String(teamId))}`;
}
