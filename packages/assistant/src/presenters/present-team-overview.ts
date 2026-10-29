import type { League, Match } from '@padel-cantabria/database';
import type { TeamOverview } from '../handlers/get-team-overview.js';
import {
  presentCompetitionLabels,
  presentPhaseOptions,
} from './present-competition-labels.js';

function presentMatch(
  match: Match,
  labels: ReturnType<typeof presentCompetitionLabels>,
) {
  return {
    home_team: match.home_team,
    away_team: match.away_team,
    date: match.date,
    status: match.status,
    location: match.location,
    league: labels.league,
    gender: labels.gender,
    phase: labels.phase,
    category: labels.category,
  };
}

export function presentTeamOverview(
  overview: TeamOverview,
  leagues: League[],
) {
  const { team, phase, phases, standing, nextMatch } = overview;

  const labels = presentCompetitionLabels(
    leagues,
    team.league_id,
    team.gender,
    phase,
    team.category,
  );

  return {
    team: {
      id: team.id,
      name: team.name,
      league: labels.league,
      gender: labels.gender,
      category: labels.category,
    },
    phases: presentPhaseOptions(
      leagues,
      team.league_id,
      team.gender,
      phases,
    ),
    phase: labels.phase,
    phase_value: labels.phase_value,
    standing: standing
      ? {
          position: standing.position,
          previous_position: standing.previous_position,
          points: standing.points,
          matches_played: standing.matches_played,
          matches_won: standing.matches_won,
          confrontations_played: standing.confrontations_played,
        }
      : null,
    next_match: nextMatch
      ? presentMatch(nextMatch, labels)
      : null,
  };
}
