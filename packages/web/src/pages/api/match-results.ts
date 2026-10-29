import type { MatchGame } from '@padel-cantabria/database';
import type { APIRoute } from 'astro';
import { summarizeMatchResult } from '@padel-cantabria/shared';
import { parseCategoryParams } from '@/routes';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export const prerender = false;

function parseMatchIds(raw: string | null): number[] | null {
  if (raw == null || raw.trim().length === 0) {
    return [];
  }

  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id));

  return ids.length > 0
    ? ids
    : null;
}

function groupGamesByMatchId(
  games: MatchGame[],
): Map<number, MatchGame[]> {
  const byMatchId = new Map<number, MatchGame[]>();

  for (const game of games) {
    const existing = byMatchId.get(game.match_id);

    if (existing) {
      existing.push(game);
    } else {
      byMatchId.set(game.match_id, [game]);
    }
  }

  return byMatchId;
}

export const GET: APIRoute = async ({ url }) => {
  const category = parseCategoryParams({
    league: url.searchParams.get('league') ?? undefined,
    gender: url.searchParams.get('gender') ?? undefined,
    phase: url.searchParams.get('phase') ?? undefined,
    category: url.searchParams.get('category') ?? undefined,
  });

  if (!category) {
    return jsonApiError(400);
  }

  const matchIds = parseMatchIds(url.searchParams.get('ids'));

  if (matchIds === null) {
    return jsonApiError(400);
  }

  try {
    const db = getDb();
    const [results, games] = await Promise.all([
      db.getMatchResults(category, matchIds),
      db.getMatchGamesByMatchIds(category, matchIds),
    ]);
    const gamesByMatchId = groupGamesByMatchId(games);
    const byMatchId = Object.fromEntries(
      results.map((result) => [
        String(result.match_id),
        summarizeMatchResult(
          result,
          gamesByMatchId.get(result.match_id) ?? [],
        ),
      ]),
    );

    return Response.json(byMatchId);
  } catch (error) {
    return jsonApiError(500, error);
  }
};
