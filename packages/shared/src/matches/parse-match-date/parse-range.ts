import type { MatchDateRange, SeasonRange } from './types.js';
import { parseMonth } from './month-labels.js';
import { parseConfirmedDate } from './parse-confirmed.js';
import { resolveYear, toUtcDate } from './season-year.js';

const SAME_MONTH_PATTERN
  = /^(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)$/u;
const CROSS_MONTH_PATTERN
  = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)\s*-\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)$/u;

export function parseMatchDateRange(
  rawDate: string,
  season: SeasonRange,
): MatchDateRange | null {
  const value = rawDate.trim();
  const confirmed = parseConfirmedDate(value, season);

  if (confirmed) {
    return confirmed;
  }

  const sameMonth = value.match(SAME_MONTH_PATTERN);

  if (sameMonth) {
    const startDay = Number(sameMonth[1]);
    const endDay = Number(sameMonth[2]);
    const month = parseMonth(sameMonth[3]!);

    if (!month) {
      return null;
    }

    const year = resolveYear(month, season);

    if (year === null) {
      return null;
    }

    return {
      start: toUtcDate(year, month, startDay),
      end: toUtcDate(year, month, endDay),
    };
  }

  const crossMonth = value.match(CROSS_MONTH_PATTERN);

  if (!crossMonth) {
    return null;
  }

  const startDay = Number(crossMonth[1]);
  const startMonth = parseMonth(crossMonth[2]!);
  const endDay = Number(crossMonth[3]);
  const endMonth = parseMonth(crossMonth[4]!);

  if (!startMonth || !endMonth) {
    return null;
  }

  const startYear = resolveYear(startMonth, season);
  const endYear = resolveYear(endMonth, season);

  if (startYear === null || endYear === null) {
    return null;
  }

  return {
    start: toUtcDate(startYear, startMonth, startDay),
    end: toUtcDate(endYear, endMonth, endDay),
  };
}
