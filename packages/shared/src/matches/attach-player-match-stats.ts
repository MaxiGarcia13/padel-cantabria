import type {
  MatchGameForTeam,
  TeamPlayer,
} from '@padel-cantabria/database';
import {
  courtOutcome,
  findMatchingPlayer,
  playerKey,
} from './match-scraped-player.js';

export interface PlayerMatchStats {
  games_played: number;
  games_won: number;
  games_lost: number;
}

export type TeamPlayerWithMatchStats = TeamPlayer & PlayerMatchStats;

function emptyStats(): PlayerMatchStats {
  return {
    games_played: 0,
    games_won: 0,
    games_lost: 0,
  };
}

export function attachPlayerMatchStats(
  players: TeamPlayer[],
  games: MatchGameForTeam[],
  teamId: number,
): TeamPlayerWithMatchStats[] {
  const statsByKey = new Map<string, PlayerMatchStats>();

  for (const player of players) {
    statsByKey.set(playerKey(player), emptyStats());
  }

  for (const game of games) {
    const isHome = game.home_team_id === teamId;
    const names = isHome
      ? [game.home_player_1, game.home_player_2]
      : [game.away_player_1, game.away_player_2];
    const outcome = courtOutcome(game.home_sets, game.away_sets, isHome);

    for (const scrapedName of names) {
      const player = findMatchingPlayer(scrapedName, players);

      if (!player) {
        continue;
      }

      const stats = statsByKey.get(playerKey(player));

      if (!stats) {
        continue;
      }

      stats.games_played += 1;

      if (outcome === 'won') {
        stats.games_won += 1;
      } else if (outcome === 'lost') {
        stats.games_lost += 1;
      }
    }
  }

  return players.map((player) => ({
    ...player,
    ...(statsByKey.get(playerKey(player)) ?? emptyStats()),
  }));
}
