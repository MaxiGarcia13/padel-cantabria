import type { APIRoute } from 'astro';
import type { TeamSummaryResponse } from '@/types/team-summary';
import { createClient } from '@padel-cantabria/database';
import { TURSO_AUTH_TOKEN, TURSO_URL } from 'astro:env/server';
import { getClosestMatches } from '@/domain/matches';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

export const GET: APIRoute = async ({ params, url }) => {
  const teamId = Number(params.id);
  const phase = url.searchParams.get('phase')?.trim() ?? '';

  if (!Number.isFinite(teamId) || !phase) {
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

    const categoryKey = {
      league_id: team.league_id,
      gender: team.gender,
      phase,
      category: team.category,
    };

    const [standing, matches, leagues] = await Promise.all([
      db.getTeamStanding(teamId, categoryKey),
      db.getTeamMatches(teamId, categoryKey),
      db.getLeagues(),
    ]);

    const season = leagues.find(
      (league) => league.league_id === team.league_id,
    )?.schedule;

    const nextMatch = season
      ? (getClosestMatches(matches, season, 1)[0] ?? null)
      : (matches[0] ?? null);

    const payload: TeamSummaryResponse = {
      standing,
      nextMatch,
    };

    return Response.json(payload);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
