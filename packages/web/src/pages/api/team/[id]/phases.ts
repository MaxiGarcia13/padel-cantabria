import type { APIRoute } from 'astro';
import { jsonApiError } from '@/server/json-api-error';
import { requireTeamById } from '@/server/require-team-by-id';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const loaded = await requireTeamById(params.id);

  if (!loaded.ok) {
    return loaded.response;
  }

  try {
    const phases = await loaded.db.getTeamPhases(loaded.team.id);
    return Response.json({ phases });
  } catch (error) {
    return jsonApiError(500, error);
  }
};
