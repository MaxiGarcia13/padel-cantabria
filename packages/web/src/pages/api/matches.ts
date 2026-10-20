import type { APIRoute } from 'astro';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';
import { parseCategoryParams } from '@/server/load-category-matches';

export const prerender = false;

export const GET: APIRoute = async ({ url }) => {
  const category = parseCategoryParams({
    league: url.searchParams.get('league') ?? undefined,
    gender: url.searchParams.get('gender') ?? undefined,
    phase: url.searchParams.get('phase') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
  });

  if (!category) {
    return jsonApiError(400);
  }

  const teamParam = url.searchParams.get('team');
  let teamId: number | undefined;

  if (teamParam != null) {
    teamId = Number(teamParam);

    if (!Number.isFinite(teamId)) {
      return jsonApiError(400);
    }
  }

  try {
    const db = getDb();
    const matches
      = teamId != null
        ? await db.getTeamMatches(teamId, category)
        : await db.getMatches(category);

    return Response.json(matches);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
