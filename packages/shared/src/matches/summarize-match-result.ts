import type { MatchGame, MatchResult } from '@padel-cantabria/database';

export type MatchWinnerSide = 'home' | 'away' | 'draw';

export interface MatchResultSummary {
  match_id: number;
  winner: MatchWinnerSide | null;
  home_pair_wins: number | null;
  away_pair_wins: number | null;
  home_sets: number | null;
  away_sets: number | null;
  home_games: number | null;
  away_games: number | null;
  score_label: string | null;
  is_played: boolean;
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

function derivePairWinsFromGames(
  games: readonly MatchGame[],
): { home: number; away: number } | null {
  if (games.length === 0) {
    return null;
  }

  let home = 0;
  let away = 0;
  let decided = 0;

  for (const game of games) {
    const outcome = compareScores(game.home_sets, game.away_sets);

    if (outcome === 'home') {
      home += 1;
      decided += 1;
    } else if (outcome === 'away') {
      away += 1;
      decided += 1;
    }
  }

  if (decided === 0) {
    return null;
  }

  return { home, away };
}

export function summarizeMatchResult(
  result: MatchResult,
  games: readonly MatchGame[] = [],
): MatchResultSummary {
  const headerPairWins = compareScores(
    result.home_matches,
    result.away_matches,
  );
  const derivedPairWins = derivePairWinsFromGames(games);

  let homePairWins: number | null = null;
  let awayPairWins: number | null = null;
  let winner: MatchWinnerSide | null = null;

  if (headerPairWins !== null) {
    homePairWins = result.home_matches;
    awayPairWins = result.away_matches;
    winner = headerPairWins;
  } else if (derivedPairWins !== null) {
    homePairWins = derivedPairWins.home;
    awayPairWins = derivedPairWins.away;
    winner = compareScores(homePairWins, awayPairWins);
  }

  const scoreLabel = formatScorePair(homePairWins, awayPairWins);
  const isPlayed = scoreLabel !== null;

  return {
    match_id: result.match_id,
    winner,
    home_pair_wins: homePairWins,
    away_pair_wins: awayPairWins,
    home_sets: result.home_sets,
    away_sets: result.away_sets,
    home_games: result.home_games,
    away_games: result.away_games,
    score_label: scoreLabel,
    is_played: isPlayed,
  };
}
