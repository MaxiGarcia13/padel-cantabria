import type { CategoryKey, Team } from '@padel-cantabria/database';

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

export function teamCategoryKey(
  team: Pick<Team, 'league_id' | 'gender' | 'category'>,
  phase: string,
): CategoryKey {
  return {
    league_id: team.league_id,
    gender: team.gender,
    phase,
    category: team.category,
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

export function buildTeamPath(category: CategoryKey, teamId: number): string {
  return `${buildCategoryPath(category)}/team/${encodeURIComponent(String(teamId))}`;
}

export function buildPlayerPath(
  category: CategoryKey,
  teamId: number,
  player: { surname: string; name: string },
): string {
  return [
    buildTeamPath(category, teamId),
    'player',
    encodeURIComponent(player.surname),
    encodeURIComponent(player.name),
  ].join('/');
}

export function buildMatchPath(
  category: CategoryKey,
  matchId: number,
): string {
  return `${buildCategoryPath(category)}/match/${encodeURIComponent(String(matchId))}`;
}

export function categorySearchParams(category: CategoryKey): URLSearchParams {
  return new URLSearchParams({
    league: String(category.league_id),
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });
}

export function teamMatchesCategory(
  team: Pick<Team, 'league_id' | 'gender' | 'category'>,
  category: CategoryKey,
): boolean {
  return (
    team.league_id === category.league_id
    && team.gender === category.gender
    && team.category === category.category
  );
}
