import type { League, Team } from '@padel-cantabria/database';
import { getTeamDisplayLabels } from '@padel-cantabria/shared';

/** Human-readable team for API / MCP. Keeps `id` for get_team_overview. */
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
