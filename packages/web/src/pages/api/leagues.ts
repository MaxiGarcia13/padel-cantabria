import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';

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
    const message
      = error instanceof Error ? error.message : 'Failed to load leagues';

    return Response.json({ error: message }, { status: 500 });
  }
};
