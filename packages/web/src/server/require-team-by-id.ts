import type { Team, WebDatabaseClient } from '@padel-cantabria/database';
import { getDb } from '@/server/db';
import { jsonApiError } from '@/server/json-api-error';

export type RequireTeamByIdResult
  = | { ok: true; db: WebDatabaseClient; team: Team }
    | { ok: false; response: Response };

export async function requireTeamById(
  rawId: string | undefined,
): Promise<RequireTeamByIdResult> {
  const teamId = Number(rawId);

  if (!Number.isFinite(teamId)) {
    return { ok: false, response: jsonApiError(400) };
  }

  try {
    const db = getDb();
    const team = await db.getTeamById(teamId);

    if (!team) {
      return { ok: false, response: jsonApiError(404) };
    }

    return { ok: true, db, team };
  } catch (error) {
    return { ok: false, response: jsonApiError(500, error) };
  }
}
