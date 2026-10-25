import type { MatchGame, MatchResult } from '@padel-cantabria/database';

export type ResultCandidate = Pick<
  MatchResult,
  'league_id' | 'gender' | 'phase' | 'category' | 'match_id'
> & {
  date: string;
};

export interface RawResultGame {
  game_number: string | null;
  home_pair_points: string | null;
  away_pair_points: string | null;
  home_sets: string | null;
  away_sets: string | null;
  partials: string | null;
  home_player_1: string | null;
  home_player_1_points: string | null;
  home_player_2: string | null;
  home_player_2_points: string | null;
  away_player_1: string | null;
  away_player_1_points: string | null;
  away_player_2: string | null;
  away_player_2_points: string | null;
}

export interface RawResultPage {
  round: string | null;
  played_at: string | null;
  location: string | null;
  rounds_order: string | null;
  home_games: string | null;
  home_sets: string | null;
  home_matches: string | null;
  away_matches: string | null;
  away_sets: string | null;
  away_games: string | null;
  games: RawResultGame[];
}

export interface ScrapedMatchResultPayload {
  result: MatchResult;
  games: MatchGame[];
}
