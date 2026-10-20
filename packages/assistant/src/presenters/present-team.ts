import type { League, Team, TeamWithStandings } from '@padel-cantabria/database';
import { getTeamDisplayLabels } from '@padel-cantabria/shared';
import { resolveCompetitionLabels } from './resolve-competition-labels.js';

export function presentTeam(team: Team, leagues: League[]) {
  const league = leagues.find((item) => item.league_id === team.league_id);
  const { genderLabel, categoryLabel } = getTeamDisplayLabels(leagues, team);

  return {
    id: team.id,
    name: team.name,
    league: league?.name ?? String(team.league_id),
    gender: genderLabel,
    category: categoryLabel,
  };
}

export function presentTeams(teams: Team[], leagues: League[]) {
  return teams.map((team) => presentTeam(team, leagues));
}

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
