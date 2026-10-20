import type { DatabaseClient } from '@padel-cantabria/database';
import {

  getConfiguredLeagueId,
} from '@padel-cantabria/database';
import { normalizeGender } from '@padel-cantabria/shared';
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
