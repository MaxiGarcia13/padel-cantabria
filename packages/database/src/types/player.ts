import type { TeamPlayer } from './team-player.js';

export interface PlayerWithTeam extends TeamPlayer {
  team_name: string;
  league_id: number;
  league_name: string;
  gender: string;
  gender_label: string;
  category: string;
  category_label: string;
}
