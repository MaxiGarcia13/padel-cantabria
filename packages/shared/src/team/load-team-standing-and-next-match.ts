import type {
  League,
  Match,
  SharedReadsClient,
  Team,
  TeamWithStandings,
} from '@padel-cantabria/database';
import { getClosestMatches } from '../matches/get-closest-matches.js';

export interface TeamStandingAndNextMatch {
  standing: TeamWithStandings | null;
  nextMatch: Match | null;
}

export async function loadTeamStandingAndNextMatch(
  db: SharedReadsClient,
  team: Team,
  phase: string,
  leagues: League[],
): Promise<TeamStandingAndNextMatch> {
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
