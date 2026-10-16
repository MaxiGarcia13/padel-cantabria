import type { CategoryKey, Team } from '@padel-cantabria/database';
import { normalizeTeamName } from './normalize-team-name.js';

function teamLookupKey(category: CategoryKey, name: string): string {
  return [
    category.league_id,
    category.gender,
    category.phase,
    category.category,
    normalizeTeamName(name),
  ].join(':');
}

export function buildTeamIdMap(teams: Team[]): Map<string, number> {
  const teamIdsByKey = new Map<string, number>();

  for (const team of teams) {
    teamIdsByKey.set(teamLookupKey(team, team.name), team.id);
  }

  return teamIdsByKey;
}

export function resolveTeamId(
  teamIdsByKey: Map<string, number>,
  category: CategoryKey,
  name: string,
): number {
  const teamId = teamIdsByKey.get(teamLookupKey(category, name));

  if (teamId === undefined) {
    throw new Error(
      `Unknown team "${name}" in league ${category.league_id}, gender ${category.gender}, phase ${category.phase}, category ${category.category}`,
    );
  }

  return teamId;
}
