import type { APIRoute } from 'astro';
import { loadTeamStandingAndNextMatch } from '@padel-cantabria/shared';
import { jsonApiError } from '@/server/json-api-error';
import { requireTeamById } from '@/server/require-team-by-id';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const phase = url.searchParams.get('phase')?.trim() ?? '';

  if (!phase) {
    return jsonApiError(400);
  }

  const loaded = await requireTeamById(params.id);

  if (!loaded.ok) {
    return loaded.response;
  }

  try {
    const leagues = await loaded.db.getLeagues();
    const payload = await loadTeamStandingAndNextMatch(
      loaded.db,
      loaded.team,
      phase,
      leagues,
    );

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
