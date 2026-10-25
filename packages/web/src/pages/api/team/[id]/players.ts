import type { APIRoute } from 'astro';
import { attachPlayerMatchStats } from '@padel-cantabria/shared';
import { jsonApiError } from '@/server/json-api-error';
import { requireTeamById } from '@/server/require-team-by-id';

export const prerender = false;

export const GET: APIRoute = async ({ params }) => {
  const loaded = await requireTeamById(params.id);

  if (!loaded.ok) {
    return loaded.response;
  }

  try {
    const [players, games] = await Promise.all([
      loaded.db.getTeamPlayers(loaded.team.id),
      loaded.db.getMatchGamesByTeamId(loaded.team.id),
    ]);

    return Response.json({
      players: attachPlayerMatchStats(players, games, loaded.team.id),
    });
  } catch (error) {
    return jsonApiError(500, error);
  }
};
