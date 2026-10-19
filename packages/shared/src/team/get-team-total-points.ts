import type { TeamPlayer } from '@padel-cantabria/database';

export function getTeamTotalPoints(players: TeamPlayer[]): number {
  return players.reduce((sum, player) => sum + player.points, 0);
}
