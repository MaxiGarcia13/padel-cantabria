import type { DatabaseClient, League, Team } from '@padel-cantabria/database';
import type { TeamSummaryResponse } from '@/types/team-summary';
import { getClosestMatches } from '@padel-cantabria/shared';

export async function loadTeamSummary(
  db: DatabaseClient,
  team: Team,
  phase: string,
  leagues: League[],
): Promise<TeamSummaryResponse> {
  const categoryKey = {
    league_id: team.league_id,
    gender: team.gender,
    phase,
    category: team.category,
  };

  const [standing, matches] = await Promise.all([
    db.getTeamStanding(team.id, categoryKey),
    db.getTeamMatches(team.id, categoryKey),
  ]);

  const season = leagues.find(
    (league) => league.league_id === team.league_id,
  )?.schedule;

  const nextMatch = season
    ? (getClosestMatches(matches, season, 1)[0] ?? null)
    : (matches[0] ?? null);

  return {
    standing,
    nextMatch,
  };
}
