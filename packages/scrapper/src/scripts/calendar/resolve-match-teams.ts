import type { MatchWrite, Team } from '@padel-cantabria/database';
import type { ScrapedCalendarMatch } from './types.js';
import { buildTeamIdMap, resolveTeamId } from './build-team-id-map.js';

export function resolveMatchTeams(
  matches: ScrapedCalendarMatch[],
  teams: Team[],
): MatchWrite[] {
  const teamIdsByKey = buildTeamIdMap(teams);

  return matches.map((match) => ({
    league_id: match.league_id,
    gender: match.gender,
    phase: match.phase,
    category: match.category,
    id: match.id,
    home_team_id: resolveTeamId(teamIdsByKey, match, match.home_team),
    away_team_id: resolveTeamId(teamIdsByKey, match, match.away_team),
    date: match.date,
    status: match.status,
    location: match.location,
    schedule: match.schedule,
  }));
}
