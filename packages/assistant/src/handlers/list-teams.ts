import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { requireCategoryMatch } from '../config/require-category-match.js';
import { resolveCategoryMatchResult } from '../config/resolve-category-value.js';
import { badRequest } from '../errors.js';
import { presentCategoryTeams } from '../presenters/present-team.js';

export interface ListTeamsQuery {
  gender?: string;
  category?: string;
  phase?: string;
}

export async function listTeamsHandler(
  db: DatabaseClient,
  { gender, category, phase }: ListTeamsQuery,
) {
  const normalizedGender = normalizeGender(gender);

  if (!normalizedGender) {
    throw badRequest('Missing gender (use M or F, or ask the user)');
  }

  if (!category?.trim()) {
    throw badRequest('Missing category');
  }

  const leagueId = getConfiguredLeagueId();
  const resolved = await resolveCategoryMatchResult(db, {
    category,
    leagueId,
    gender: normalizedGender,
  });
  const categoryMatch = requireCategoryMatch(resolved);

  const phaseValue = phase?.trim() || categoryMatch.phase;

  const [teams, leagues] = await Promise.all([
    db.getTeams({
      league_id: leagueId,
      gender: normalizedGender,
      phase: phaseValue,
      category: categoryMatch.category,
    }),
    db.getLeagues(),
  ]);

  return presentCategoryTeams(
    {
      leagueId,
      gender: normalizedGender,
      phase: phaseValue,
      category: categoryMatch.category,
      teams,
    },
    leagues,
  );
}
