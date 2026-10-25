import type { APIRoute } from 'astro';
import { summarizeMatchResult } from '@padel-cantabria/shared';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';
import { parseCategoryParams } from '@/server/load-category-matches';

export const prerender = false;

function parseMatchIds(raw: string | null): number[] | null {
  if (raw == null || raw.trim().length === 0) {
    return [];
  }

  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id));

  return ids.length > 0 ? ids : null;
}

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

  const matchIds = parseMatchIds(url.searchParams.get('ids'));

  if (matchIds === null) {
    return jsonApiError(400);
  }

  try {
    const db = getDb();
    const results = await db.getMatchResults(category, matchIds);
    const byMatchId = Object.fromEntries(
      results.map((result) => [
        String(result.match_id),
        summarizeMatchResult(result),
      ]),
    );

    return Response.json(byMatchId);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
