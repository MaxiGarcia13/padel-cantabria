import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
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
    return Response.json(
      { error: 'Missing or invalid league, gender, phase, or category' },
      { status: 400 },
    );
  }

  try {
    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    const matches = await db.getMatches(category);

    return Response.json(matches);
  } catch (error) {
    const message
      = error instanceof Error ? error.message : 'Failed to load matches';

    return Response.json({ error: message }, { status: 500 });
  }
};
