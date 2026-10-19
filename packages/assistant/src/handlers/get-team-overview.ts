import type { Match, Team, TeamWithStandings } from '@padel-cantabria/database';
import type { DatabaseClient } from '../db.js';
import { getClosestMatches } from '@padel-cantabria/shared';
import { badRequest, notFound } from '../errors.js';
import { presentTeamOverview } from '../presenters/present-team-overview.js';

export interface TeamOverview {
  team: Team;
  phases: string[];
  phase: string;
  standing: TeamWithStandings | null;
  nextMatch: Match | null;
}

export async function getTeamOverview(
  db: DatabaseClient,
  teamId: number,
  phaseQuery?: string,
) {
  if (!Number.isFinite(teamId) || teamId <= 0) {
    throw badRequest('Invalid team id');
  }

  const team = await db.getTeamById(teamId);

  if (!team) {
    throw notFound(`Team not found: ${teamId}`);
  }

  const [phases, leagues] = await Promise.all([
    db.getTeamPhases(team.id),
    db.getLeagues(),
  ]);

  const phase = phaseQuery?.trim() || phases[0];

  if (!phase) {
    return presentTeamOverview(
      {
        team,
        phases,
        phase: '',
        standing: null,
        nextMatch: null,
      },
      leagues,
    );
  }

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

  return presentTeamOverview(
    {
      team,
      phases,
      phase,
      standing,
      nextMatch,
    },
    leagues,
  );
}
