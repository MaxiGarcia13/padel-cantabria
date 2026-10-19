import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { presentPhases } from '../presenters/present-phase.js';

const DEFAULT_LIMIT = 15;

export interface SearchPhasesQuery {
  q?: string;
  gender?: string;
  limit?: number;
}

export async function searchPhasesHandler(
  db: DatabaseClient,
  { q = '', gender, limit = DEFAULT_LIMIT }: SearchPhasesQuery,
) {
  const phases = await db.searchPhases({
    query: q,
    league_id: getConfiguredLeagueId(),
    gender: normalizeGender(gender),
    limit,
  });

  return presentPhases(phases);
}
