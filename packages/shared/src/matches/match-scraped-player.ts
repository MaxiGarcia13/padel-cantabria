import type { TeamPlayer } from '@padel-cantabria/database';
import { foldText } from '../text/fold-text.js';

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

export function findMatchingPlayer(
  scrapedName: string,
  players: TeamPlayer[],
): TeamPlayer | null {
  const matches = players.filter((player) =>
    scrapedMatchesPlayer(scrapedName, player),
  );

  return matches.length === 1 ? matches[0]! : null;
}

export function courtOutcome(
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

export function playerKey(player: Pick<TeamPlayer, 'surname' | 'name'>): string {
  return `${player.surname}\0${player.name}`;
}
