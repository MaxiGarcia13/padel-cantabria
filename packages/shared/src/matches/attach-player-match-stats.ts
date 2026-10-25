import type {
  MatchGameForTeam,
  TeamPlayer,
} from '@padel-cantabria/database';
import { foldText } from '../text/fold-text.js';

export interface PlayerMatchStats {
  games_played: number;
  games_won: number;
  games_lost: number;
}

export type TeamPlayerWithMatchStats = TeamPlayer & PlayerMatchStats;

function normalizePlayerLabel(raw: string): string {
  return foldText(raw).replace(/\s+/g, ' ');
}

function tokenizePlayerLabel(raw: string): string[] {
  const normalized = normalizePlayerLabel(raw);

  if (normalized.length === 0) {
    return [];
  }

  return normalized.split(' ').filter((token) => token.length > 0);
}

function tokensContainedIn(
  needle: readonly string[],
  haystack: readonly string[],
): boolean {
  if (needle.length === 0) {
    return false;
  }

  const haystackTokens = new Set(haystack);

  return needle.every((token) => haystackTokens.has(token));
}

function scrapedMatchesPlayer(
  scrapedName: string,
  player: TeamPlayer,
): boolean {
  const scrapedTokens = tokenizePlayerLabel(scrapedName);

  // Single-token labels are too weak (e.g. shared first names).
  if (scrapedTokens.length < 2) {
    return false;
  }

  const nameSurnameTokens = tokenizePlayerLabel(
    `${player.name} ${player.surname}`,
  );
  const surnameNameTokens = tokenizePlayerLabel(
    `${player.surname} ${player.name}`,
  );

  return (
    tokensContainedIn(scrapedTokens, nameSurnameTokens)
    || tokensContainedIn(scrapedTokens, surnameNameTokens)
  );
}

function findMatchingPlayer(
  scrapedName: string,
  players: TeamPlayer[],
): TeamPlayer | null {
  const matches = players.filter((player) =>
    scrapedMatchesPlayer(scrapedName, player),
  );

  return matches.length === 1 ? matches[0]! : null;
}

function courtOutcome(
  homeSets: number | null,
  awaySets: number | null,
  isHome: boolean,
): 'won' | 'lost' | null {
  if (homeSets === null || awaySets === null || homeSets === awaySets) {
    return null;
  }

  const homeWon = homeSets > awaySets;

  if (isHome) {
    return homeWon ? 'won' : 'lost';
  }

  return homeWon ? 'lost' : 'won';
}

function emptyStats(): PlayerMatchStats {
  return {
    games_played: 0,
    games_won: 0,
    games_lost: 0,
  };
}

function playerKey(player: TeamPlayer): string {
  return `${player.surname}\0${player.name}`;
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
