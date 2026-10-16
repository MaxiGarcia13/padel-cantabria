import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
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

  try {
    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    const teams = await db.getTeams(category);

    return Response.json(teams);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
