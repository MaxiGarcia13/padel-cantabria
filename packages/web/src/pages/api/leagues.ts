import type { APIRoute } from 'astro';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const db = getDb();
    const leagues = await db.getLeagues();

    return Response.json(leagues);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
