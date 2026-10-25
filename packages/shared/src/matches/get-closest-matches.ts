import type { Match } from '@padel-cantabria/database';
import type { WeekendRange } from './get-active-weekend-range.js';
import type { SeasonRange } from './parse-match-date/index.js';
import {
  getActiveWeekendRange,
  getWeekendRangeContaining,

} from './get-active-weekend-range.js';
import { getMatchSortTime } from './parse-match-date/index.js';

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

function matchesInRange(
  sorted: MatchWithSortTime[],
  range: WeekendRange,
): MatchWithSortTime[] {
  return sorted.filter(
    (entry) =>
      entry.sortTime !== null
      && entry.sortTime >= range.start
      && entry.sortTime < range.end,
  );
}

function resolveWeekendMatches(
  sorted: MatchWithSortTime[],
  now: Date,
): MatchWithSortTime[] {
  const activeWeekend = getActiveWeekendRange(now);
  const inActiveWeekend = matchesInRange(sorted, activeWeekend);

  if (inActiveWeekend.length > 0) {
    return inActiveWeekend;
  }

  const nextMatch = sorted.find(
    (entry) => entry.sortTime !== null && entry.sortTime >= activeWeekend.start,
  );

  if (!nextMatch || nextMatch.sortTime === null) {
    return [];
  }

  return matchesInRange(sorted, getWeekendRangeContaining(nextMatch.sortTime));
}

export function getClosestMatches(
  matches: Match[],
  season: SeasonRange,
  limit = DEFAULT_CLOSEST_LIMIT,
  now = new Date(),
): Match[] {
  const sorted = toSortedMatches(matches, season);
  const selected = resolveWeekendMatches(sorted, now);

  return selected.slice(0, limit).map((entry) => entry.match);
}

export function sortMatchesByDate(
  matches: Match[],
  season: SeasonRange,
): Match[] {
  return toSortedMatches(matches, season).map((entry) => entry.match);
}
