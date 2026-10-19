import type { TeamPlayer } from './team-player.js';

/** Player row with team competition context (from JOIN teams). */
export interface PlayerWithTeam extends TeamPlayer {
  team_name: string;
  league_id: number;
  gender: string;
  category: string;
}
