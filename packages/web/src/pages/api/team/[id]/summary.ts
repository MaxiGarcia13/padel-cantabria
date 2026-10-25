import type { APIRoute } from 'astro';
import { loadTeamStandingAndNextMatch } from '@padel-cantabria/shared';
import { parseCategoryParams, teamMatchesCategory } from '@/routes';
import { jsonApiError } from '@/server/json-api-error';
import { requireTeamById } from '@/server/require-team-by-id';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const categoryKey = parseCategoryParams({
    league: url.searchParams.get('league') ?? undefined,
    gender: url.searchParams.get('gender') ?? undefined,
    phase: url.searchParams.get('phase') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
  });

  if (!categoryKey) {
    return jsonApiError(400);
  }

  const loaded = await requireTeamById(params.id);

  if (!loaded.ok) {
    return loaded.response;
  }

  if (!teamMatchesCategory(loaded.team, categoryKey)) {
    return jsonApiError(404);
  }

  try {
    const leagues = await loaded.db.getLeagues();
    const payload = await loadTeamStandingAndNextMatch(
      loaded.db,
      loaded.team,
      categoryKey.phase,
      leagues,
    );

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
