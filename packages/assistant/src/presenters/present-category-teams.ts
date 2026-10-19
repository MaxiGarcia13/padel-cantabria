import type { League, TeamWithStandings } from '@padel-cantabria/database';
import { resolveCompetitionLabels } from './resolve-competition-labels.js';

export interface CategoryTeamsInput {
  leagueId: number;
  gender: string;
  phase: string;
  category: string;
  teams: TeamWithStandings[];
}

function presentStandingTeam(team: TeamWithStandings) {
  return {
    id: team.id,
    name: team.name,
    position: team.position,
    points: team.points,
    matches_played: team.matches_played,
    matches_won: team.matches_won,
    confrontations_played: team.confrontations_played,
  };
}

/** Teams in one category, with shared competition labels for MCP/chat. */
export function presentCategoryTeams(
  input: CategoryTeamsInput,
  leagues: League[],
) {
  const labels = resolveCompetitionLabels(
    leagues,
    input.leagueId,
    input.gender,
    input.phase,
    input.category,
  );

  return {
    league: labels.league,
    gender: labels.gender,
    gender_code: labels.genderCode,
    phase: labels.phase,
    phase_value: labels.phaseValue,
    category: labels.category,
    category_value: labels.categoryValue,
    teams: input.teams.map(presentStandingTeam),
  };
}
