import type { PlayerWithTeam, TeamPlayer } from '@padel-cantabria/database';

/** Human-readable player for API / MCP (labels over opaque codes). */
export function presentPlayer(player: PlayerWithTeam) {
  return {
    name: player.name,
    surname: player.surname,
    team: player.team_name,
    team_id: player.team_id,
    league: player.league_name,
    gender: player.gender_label,
    category: player.category_label || player.category,
    points: player.points,
    position: player.position,
  };
}

export function presentPlayers(players: PlayerWithTeam[]) {
  return players.map(presentPlayer);
}

/** Roster row for a known team (no league joins; team context is separate). */
export function presentTeamPlayer(player: TeamPlayer) {
  return {
    name: player.name,
    surname: player.surname,
    points: player.points,
    position: player.position,
    previous_position: player.previous_position,
    previous_points: player.previous_points,
  };
}

export function presentTeamPlayers(players: TeamPlayer[]) {
  return players.map(presentTeamPlayer);
}

/** Aggregates for compare / summarize without relying on model arithmetic. */
export function presentRosterTotals(players: TeamPlayer[]) {
  let points = 0;
  let previousPoints = 0;
  let hasPreviousPoints = false;

  for (const player of players) {
    points += player.points;
    if (player.previous_points != null) {
      previousPoints += player.previous_points;
      hasPreviousPoints = true;
    }
  }

  return {
    player_count: players.length,
    points,
    previous_points: hasPreviousPoints ? previousPoints : null,
  };
}
