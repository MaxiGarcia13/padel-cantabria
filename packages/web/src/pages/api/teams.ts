import type { APIRoute } from 'astro';
import { parseCategoryParams } from '@/routes';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

// Intentionally lower than assistant/DB default (15) for autocomplete UX.
const DEFAULT_SEARCH_LIMIT = 10;

export const GET: APIRoute = async ({ url }) => {
  const league = url.searchParams.get('league') ?? undefined;
  const gender = url.searchParams.get('gender') ?? undefined;
  const phase = url.searchParams.get('phase') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;
  const categoryKey = parseCategoryParams({
    league,
    gender,
    phase,
    category,
  });

  try {
    const db = getDb();

    if (categoryKey) {
      const teams = await db.getTeams(categoryKey);
      return Response.json(teams);
    }

    if (gender || phase || category) {
      return jsonApiError(400);
    }

    const query = url.searchParams.get('q') ?? '';
    const limitParam = Number(url.searchParams.get('limit'));
    const limit = Number.isFinite(limitParam) && limitParam > 0
      ? Math.floor(limitParam)
      : DEFAULT_SEARCH_LIMIT;
    const leagueId = league != null ? Number(league) : undefined;
    const teams = await db.searchTeams({
      query,
      limit,
      league_id: Number.isFinite(leagueId) ? leagueId : undefined,
    });

    return Response.json(teams);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
