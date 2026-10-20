import type { APIRoute } from 'astro';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const teamId = Number(params.id);

  if (!Number.isFinite(teamId)) {
    return jsonApiError(400);
  }

  try {
    const db = getDb();
    const team = await db.getTeamById(teamId);

    if (!team) {
      return jsonApiError(404);
    }

    const players = await db.getTeamPlayers(teamId);

    return Response.json({ players });
  } catch (error) {
    return jsonApiError(500, error);
  }
};
