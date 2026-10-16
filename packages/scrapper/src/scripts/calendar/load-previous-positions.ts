import type {
  CategoryKey,
  TeamWithStandings,
} from '@padel-cantabria/database';
import { teamStandingKey } from './team-standing-key.js';

export async function loadPreviousPositions(
  getTeams: (category: CategoryKey) => Promise<TeamWithStandings[]>,
  categories: CategoryKey[],
): Promise<Map<string, number | null>> {
  const previousPositions = new Map<string, number | null>();

  for (const category of categories) {
    const teams = await getTeams(category);

    for (const team of teams) {
      previousPositions.set(
        teamStandingKey(category, team.id),
        team.position,
      );
    }
  }

  return previousPositions;
}
