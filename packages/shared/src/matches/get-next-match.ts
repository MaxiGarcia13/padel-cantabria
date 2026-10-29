import type { Match } from '@padel-cantabria/database';
import type { MatchDateRange, SeasonRange } from './parse-match-date/index.js';
import { parseMatchDateRange } from './parse-match-date/index.js';

const DAY_MS = 24 * 60 * 60 * 1000;

function windowEndsAt(range: MatchDateRange): number {
  if (range.start.getTime() === range.end.getTime()) {
    const start = range.start;

    return Date.UTC(
      start.getUTCFullYear(),
      start.getUTCMonth(),
      start.getUTCDate() + 1,
    );
  }

  return range.end.getTime() + DAY_MS;
}

export function getNextMatch(
  matches: Match[],
  season: SeasonRange,
  now = new Date(),
): Match | null {
  const nowMs = now.getTime();

  const upcoming = matches
    .flatMap((match) => {
      const range = parseMatchDateRange(match.date, season);

      if (!range || windowEndsAt(range) <= nowMs) {
        return [];
      }

      return [
        {
          match,
          start: range.start.getTime(),
        },
      ];
    })
    .sort((left, right) => {
      if (left.start !== right.start) {
        return left.start - right.start;
      }

      return left.match.id - right.match.id;
    });

  return upcoming[0]?.match ?? null;
}
