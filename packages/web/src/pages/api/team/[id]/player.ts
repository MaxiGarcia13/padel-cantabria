import type { APIRoute } from 'astro';
import { jsonApiError } from '@/server/json-api-error';
import { loadTeamPlayerPageData } from '@/server/load-team-player-page-data';
import { requireTeamById } from '@/server/require-team-by-id';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const surname = url.searchParams.get('surname');
  const name = url.searchParams.get('name');

  if (!surname || !name) {
    return jsonApiError(400);
  }

  const loaded = await requireTeamById(params.id);

  if (!loaded.ok) {
    return loaded.response;
  }

  try {
    const payload = await loadTeamPlayerPageData(
      loaded.db,
      loaded.team,
      surname,
      name,
    );

    if (!payload) {
      return jsonApiError(404);
    }

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
