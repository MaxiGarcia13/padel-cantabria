import type {
  MatchGameForTeam,
  TeamPlayer,
} from '@padel-cantabria/database';
import {
  courtOutcome,
  findMatchingPlayer,
  playerKey,
} from './match-scraped-player.js';

export interface TeamCouplePlayer {
  name: string;
  surname: string;
}

export interface TeamCoupleStats {
  player_1: TeamCouplePlayer;
  player_2: TeamCouplePlayer;
  games_played: number;
  games_won: number;
  games_lost: number;
  average: number | null;
}

interface MutableCoupleStats {
  player_1: TeamCouplePlayer;
  player_2: TeamCouplePlayer;
  games_played: number;
  games_won: number;
  games_lost: number;
}

function coupleKey(a: TeamPlayer, b: TeamPlayer): string {
  const keyA = playerKey(a);
  const keyB = playerKey(b);

  return keyA < keyB ? `${keyA}\n${keyB}` : `${keyB}\n${keyA}`;
}

function orderedPlayers(
  a: TeamPlayer,
  b: TeamPlayer,
): [TeamPlayer, TeamPlayer] {
  return playerKey(a) <= playerKey(b) ? [a, b] : [b, a];
}

function toCouplePlayer(player: TeamPlayer): TeamCouplePlayer {
  return {
    name: player.name,
    surname: player.surname,
  };
}

function emptyCoupleStats(
  playerA: TeamPlayer,
  playerB: TeamPlayer,
): MutableCoupleStats {
  const [first, second] = orderedPlayers(playerA, playerB);

  return {
    player_1: toCouplePlayer(first),
    player_2: toCouplePlayer(second),
    games_played: 0,
    games_won: 0,
    games_lost: 0,
  };
}

function coupleAverage(wins: number, losses: number): number | null {
  const decided = wins + losses;

  if (decided === 0) {
    return null;
  }

  return wins / decided;
}

function compareCouples(a: TeamCoupleStats, b: TeamCoupleStats): number {
  if (b.games_won !== a.games_won) {
    return b.games_won - a.games_won;
  }

  if (b.games_played !== a.games_played) {
    return b.games_played - a.games_played;
  }

  return (b.average ?? -1) - (a.average ?? -1);
}

export function computeTeamCoupleStats(
  players: TeamPlayer[],
  games: MatchGameForTeam[],
  teamId: number,
): TeamCoupleStats[] {
  const statsByKey = new Map<string, MutableCoupleStats>();

  for (const game of games) {
    const isHome = game.home_team_id === teamId;
    const names = isHome
      ? [game.home_player_1, game.home_player_2]
      : [game.away_player_1, game.away_player_2];
    const matched = names
      .map((scrapedName) => findMatchingPlayer(scrapedName, players))
      .filter((player): player is TeamPlayer => player !== null);

    if (matched.length !== 2) {
      continue;
    }

    const playerA = matched[0]!;
    const playerB = matched[1]!;

    if (playerKey(playerA) === playerKey(playerB)) {
      continue;
    }

    const key = coupleKey(playerA, playerB);
    let stats = statsByKey.get(key);

    if (!stats) {
      stats = emptyCoupleStats(playerA, playerB);
      statsByKey.set(key, stats);
    }

    stats.games_played += 1;

    const outcome = courtOutcome(game.home_sets, game.away_sets, isHome);

    if (outcome === 'won') {
      stats.games_won += 1;
    } else if (outcome === 'lost') {
      stats.games_lost += 1;
    }
  }

  return [...statsByKey.values()]
    .map((stats) => ({
      ...stats,
      average: coupleAverage(stats.games_won, stats.games_lost),
    }))
    .sort(compareCouples);
}
