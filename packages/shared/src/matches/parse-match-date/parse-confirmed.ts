import type { MatchDateRange, SeasonRange } from './types.js';
import { parseMonth } from './month-labels.js';
import { resolveYear, toUtcDate } from './season-year.js';

const CONFIRMED_PATTERN
  = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)\s+(\d{1,2}):(\d{2})/u;

export function parseConfirmedDate(
  value: string,
  season: SeasonRange,
): MatchDateRange | null {
  const confirmed = value.match(CONFIRMED_PATTERN);

  if (!confirmed) {
    return null;
  }

  const day = Number(confirmed[1]);
  const month = parseMonth(confirmed[2]!);
  const hours = Number(confirmed[3]);
  const minutes = Number(confirmed[4]);

  if (!month) {
    return null;
  }

  const year = resolveYear(month, season);

  if (year === null) {
    return null;
  }

  const at = toUtcDate(year, month, day, hours, minutes);

  return { start: at, end: at };
}
