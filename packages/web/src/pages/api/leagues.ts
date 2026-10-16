import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async () => {
  try {
    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    const leagues = await db.getLeagues();

    return Response.json(leagues);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
