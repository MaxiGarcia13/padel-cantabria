import type { SeasonRange } from './types.js';
import { parseMatchDateRange } from './parse-range.js';

export function getMatchSortTime(
  rawDate: string,
  season: SeasonRange,
): number | null {
  const range = parseMatchDateRange(rawDate, season);

  return range
    ? range.start.getTime()
    : null;
}
