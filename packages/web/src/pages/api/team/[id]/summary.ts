import type { APIRoute } from 'astro';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';
import { loadTeamSummary } from '@/server/load-team-summary';

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

    const payload = await loadTeamSummary(db, team, phase, leagues);

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
