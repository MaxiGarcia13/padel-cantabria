import type { DatabaseClient } from '@padel-cantabria/database';
import { requireConfiguredCategory } from '../config/require-configured-category.js';
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
  const {
    leagueId,
    gender: normalizedGender,
    categoryMatch,
  } = await requireConfiguredCategory(db, { gender, category });

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
