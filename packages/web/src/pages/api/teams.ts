import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
import { jsonApiError } from '@/server/json-api-error';
import { parseCategoryParams } from '@/server/load-category-matches';

export const prerender = false;

const DEFAULT_SEARCH_LIMIT = 10;

export const GET: APIRoute = async ({ url }) => {
  const league = url.searchParams.get('league') ?? undefined;
  const gender = url.searchParams.get('gender') ?? undefined;
  const phase = url.searchParams.get('phase') ?? undefined;
  const category = url.searchParams.get('category') ?? undefined;
  const hasCategoryParams = Boolean(league || gender || phase || category);

  try {
    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });

    if (!hasCategoryParams) {
      const query = url.searchParams.get('q') ?? '';
      const limitParam = Number(url.searchParams.get('limit'));
      const limit = Number.isFinite(limitParam) && limitParam > 0
        ? Math.floor(limitParam)
        : DEFAULT_SEARCH_LIMIT;
      const teams = await db.searchTeams({ query, limit });

      return Response.json(teams);
    }

    const categoryKey = parseCategoryParams({
      league,
      gender,
      phase,
      category,
    });

    if (!categoryKey) {
      return jsonApiError(400);
    }

    const teams = await db.getTeams(categoryKey);

    return Response.json(teams);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
