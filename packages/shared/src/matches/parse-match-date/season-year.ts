import type { SeasonRange } from './types.js';

export function parseIsoDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month - 1, day));
}

export function resolveYear(
  month: number,
  season: SeasonRange,
): number | null {
  const seasonStart = parseIsoDate(season.start_date);
  const seasonEnd = parseIsoDate(season.end_date);

  if (!seasonStart || !seasonEnd) {
    return null;
  }

  const startYear = seasonStart.getUTCFullYear();
  const endYear = seasonEnd.getUTCFullYear();
  const years = startYear === endYear
    ? [startYear]
    : [startYear, endYear];

  for (const year of years) {
    const candidate = Date.UTC(year, month - 1, 1);
    const seasonStartMonth = Date.UTC(
      seasonStart.getUTCFullYear(),
      seasonStart.getUTCMonth(),
      1,
    );
    const seasonEndMonth = Date.UTC(
      seasonEnd.getUTCFullYear(),
      seasonEnd.getUTCMonth(),
      1,
    );

    if (candidate >= seasonStartMonth && candidate <= seasonEndMonth) {
      return year;
    }
  }

  return startYear;
}

export function toUtcDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}
