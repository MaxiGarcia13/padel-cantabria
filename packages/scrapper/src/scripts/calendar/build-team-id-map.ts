import type { CategoryKey, Team } from '@padel-cantabria/database';
import { normalizeTeamName } from './normalize-team-name.js';

function teamLookupKey(
  leagueId: number,
  gender: string,
  category: string,
  name: string,
): string {
  return [
    leagueId,
    gender,
    category,
    normalizeTeamName(name),
  ].join(':');
}

export function buildTeamIdMap(teams: Team[]): Map<string, number> {
  const teamIdsByKey = new Map<string, number>();

  for (const team of teams) {
    teamIdsByKey.set(
      teamLookupKey(team.league_id, team.gender, team.category, team.name),
      team.id,
    );
  }

  return teamIdsByKey;
}

export function resolveTeamId(
  teamIdsByKey: Map<string, number>,
  category: CategoryKey,
  name: string,
): number {
  const teamId = teamIdsByKey.get(
    teamLookupKey(
      category.league_id,
      category.gender,
      category.category,
      name,
    ),
  );

  if (teamId === undefined) {
    throw new Error(
      `Unknown team "${name}" in league ${category.league_id}, gender ${category.gender}, category ${category.category}`,
    );
  }

  return teamId;
}
