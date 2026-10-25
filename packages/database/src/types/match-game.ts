export interface MatchGame {
  league_id: number;
  gender: string;
  phase: string;
  category: string;
  match_id: number;
  game_number: number;
  home_pair_points: number | null;
  away_pair_points: number | null;
  home_sets: number | null;
  away_sets: number | null;
  partials: string | null;
  home_player_1: string;
  home_player_1_points: number | null;
  home_player_2: string;
  home_player_2_points: number | null;
  away_player_1: string;
  away_player_1_points: number | null;
  away_player_2: string;
  away_player_2_points: number | null;
}
