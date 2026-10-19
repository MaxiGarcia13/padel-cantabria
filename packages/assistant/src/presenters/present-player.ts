import type { PlayerWithTeam } from '@padel-cantabria/database';

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
