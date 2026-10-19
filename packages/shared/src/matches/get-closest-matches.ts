import type { Match } from '@padel-cantabria/database';
import type { SeasonRange } from './parse-match-date.js';
import { getMatchSortTime } from './parse-match-date.js';

const DEFAULT_CLOSEST_LIMIT = 5;

interface MatchWithSortTime {
  match: Match;
  sortTime: number | null;
}

function compareMatches(left: MatchWithSortTime, right: MatchWithSortTime): number {
  if (left.sortTime === null && right.sortTime === null) {
    return left.match.id - right.match.id;
  }

  if (left.sortTime === null) {
    return 1;
  }

  if (right.sortTime === null) {
    return -1;
  }

  if (left.sortTime !== right.sortTime) {
    return left.sortTime - right.sortTime;
  }

  return left.match.id - right.match.id;
}

function toSortedMatches(
  matches: Match[],
  season: SeasonRange,
): MatchWithSortTime[] {
  return matches
    .map((match) => ({
      match,
      sortTime: getMatchSortTime(match.date, season),
    }))
    .sort(compareMatches);
}

export function getClosestMatches(
  matches: Match[],
  season: SeasonRange,
  limit = DEFAULT_CLOSEST_LIMIT,
  now = new Date(),
): Match[] {
  const sorted = toSortedMatches(matches, season);
  const todayUtc = Date.UTC(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  );

  const upcoming = sorted.filter(
    (entry) => entry.sortTime !== null && entry.sortTime >= todayUtc,
  );
  const selected = upcoming.length > 0 ? upcoming : sorted;

  return selected.slice(0, limit).map((entry) => entry.match);
}

export function sortMatchesByDate(
  matches: Match[],
  season: SeasonRange,
): Match[] {
  return toSortedMatches(matches, season).map((entry) => entry.match);
}
