export interface MatchResult {
  league_id: number;
  gender: string;
  phase: string;
  category: string;
  match_id: number;
  round: number | null;
  played_at: string | null;
  location: string | null;
  rounds_order: string | null;
  home_games: number | null;
  home_sets: number | null;
  home_matches: number | null;
  away_matches: number | null;
  away_sets: number | null;
  away_games: number | null;
}
