import type { MatchResult } from '@padel-cantabria/database';

export type MatchWinnerSide = 'home' | 'away' | 'draw';

export interface MatchResultSummary {
  match_id: number;
  winner: MatchWinnerSide | null;
  home_sets: number | null;
  away_sets: number | null;
  home_games: number | null;
  away_games: number | null;
  score_label: string | null;
}

function compareScores(
  home: number | null,
  away: number | null,
): MatchWinnerSide | null {
  if (home === null || away === null) {
    return null;
  }

  if (home > away) {
    return 'home';
  }

  if (away > home) {
    return 'away';
  }

  return 'draw';
}

function formatScorePair(
  home: number | null,
  away: number | null,
): string | null {
  if (home === null || away === null) {
    return null;
  }

  return `${home}-${away}`;
}

export function summarizeMatchResult(
  result: MatchResult,
): MatchResultSummary {
  const setsWinner = compareScores(result.home_sets, result.away_sets);
  const gamesWinner = compareScores(result.home_games, result.away_games);
  const scoreLabel
    = formatScorePair(result.home_sets, result.away_sets)
      ?? formatScorePair(result.home_games, result.away_games);

  return {
    match_id: result.match_id,
    winner: setsWinner ?? gamesWinner,
    home_sets: result.home_sets,
    away_sets: result.away_sets,
    home_games: result.home_games,
    away_games: result.away_games,
    score_label: scoreLabel,
  };
}
