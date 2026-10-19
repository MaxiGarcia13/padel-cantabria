import type { TeamPlayer } from './team-player.js';

/** Player row with team competition context (from JOIN teams + labels). */
export interface PlayerWithTeam extends TeamPlayer {
  team_name: string;
  league_id: number;
  league_name: string;
  gender: string;
  gender_label: string;
  category: string;
  category_label: string;
}
