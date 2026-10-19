import type { DatabaseClient } from '../db.js';
import { normalizeGender } from '../config/normalize-gender.js';
import { getConfiguredLeagueId } from '../config/parse-league-ids.js';
import { resolveCategoryMatch } from '../config/resolve-category-value.js';
import { badRequest } from '../errors.js';
import { presentCategoryTeams } from '../presenters/present-category-teams.js';

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
  const categoryMatch = await resolveCategoryMatch(db, {
    category,
    leagueId,
    gender: normalizedGender,
  });

  if (!categoryMatch) {
    throw badRequest(
      'Unknown or ambiguous category; use search_categories or ask the user',
    );
  }

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
