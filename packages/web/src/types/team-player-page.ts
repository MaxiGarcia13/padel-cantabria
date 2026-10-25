import type { Team, TeamPlayer } from '@padel-cantabria/database';
import type {
  PlayerCourtAppearance,
  PlayerPageStats,
} from '@padel-cantabria/shared';

export interface PlayerCourtAppearanceWithOpponent extends PlayerCourtAppearance {
  opponent_team_name: string | null;
}

export interface TeamPlayerPagePayload {
  team: Team;
  player: TeamPlayer;
  stats: Omit<PlayerPageStats, 'recent_courts'> & {
    recent_courts: PlayerCourtAppearanceWithOpponent[];
  };
}
