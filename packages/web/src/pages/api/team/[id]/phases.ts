import type { APIRoute } from 'astro';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const teamId = Number(params.id);

  if (!Number.isFinite(teamId)) {
    return jsonApiError(400);
  }

  try {
    const db = createClient({
      url: TURSO_URL,
      authToken: TURSO_AUTH_TOKEN,
    });
    const team = await db.getTeamById(teamId);

    if (!team) {
      return jsonApiError(404);
    }

    const phases = await db.getTeamPhases(teamId);

    return Response.json({ phases });
  } catch (error) {
    return jsonApiError(500, error);
  }
};
