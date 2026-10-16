import type { CategoryKey, Match } from '@padel-cantabria/database';
import type { SeasonRange } from '@/domain/matches';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';

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

export async function loadCategoryMatches(category: CategoryKey): Promise<{
  matches: Match[];
  season: SeasonRange | null;
}> {
  const db = createClient({
    url: TURSO_URL,
    authToken: TURSO_AUTH_TOKEN,
  });

  const [matches, leagues] = await Promise.all([
    db.getMatches(category),
    db.getLeagues(),
  ]);

  const league = leagues.find(
    (entry) => entry.league_id === category.league_id,
  );

  return {
    matches,
    season: league?.schedule ?? null,
  };
}
