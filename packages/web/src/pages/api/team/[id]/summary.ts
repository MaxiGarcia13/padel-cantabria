import type { APIRoute } from 'astro';
import { loadTeamStandingAndNextMatch } from '@padel-cantabria/shared';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const teamId = Number(params.id);
  const phase = url.searchParams.get('phase')?.trim() ?? '';

  if (!Number.isFinite(teamId) || !phase) {
    return jsonApiError(400);
  }

  try {
    const db = getDb();
    const [team, leagues] = await Promise.all([
      db.getTeamById(teamId),
      db.getLeagues(),
    ]);

    if (!team) {
      return jsonApiError(404);
    }

    const payload = await loadTeamStandingAndNextMatch(
      db,
      team,
      phase,
      leagues,
    );

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
