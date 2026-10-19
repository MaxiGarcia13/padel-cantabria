const MONTH_BY_LABEL: Record<string, number> = {
  ene: 1,
  feb: 2,
  mar: 3,
  abr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  ago: 8,
  sep: 9,
  oct: 10,
  nov: 11,
  dic: 12,
};

const SAME_MONTH_PATTERN
  = /^(\d{1,2})\s*-\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)$/u;
const CROSS_MONTH_PATTERN
  = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)\s*-\s*(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)$/u;
const CONFIRMED_PATTERN
  = /^(\d{1,2})\s+([A-Za-zÁÉÍÓÚáéíóúü]+)\s+(\d{1,2}):(\d{2})/u;

export interface SeasonRange {
  start_date: string;
  end_date: string;
}

export interface MatchDateRange {
  start: Date;
  end: Date;
}

function parseMonth(label: string): number | null {
  const month = MONTH_BY_LABEL[label.trim().toLowerCase().slice(0, 3)];

  return month ?? null;
}

function parseIsoDate(value: string): Date | null {
  const match = value.trim().match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);

  return new Date(Date.UTC(year, month - 1, day));
}

function resolveYear(
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
  const years = startYear === endYear ? [startYear] : [startYear, endYear];

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

function toUtcDate(
  year: number,
  month: number,
  day: number,
  hours = 0,
  minutes = 0,
): Date {
  return new Date(Date.UTC(year, month - 1, day, hours, minutes));
}

function parseConfirmedDate(
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

export function getMatchSortTime(
  rawDate: string,
  season: SeasonRange,
): number | null {
  const range = parseMatchDateRange(rawDate, season);

  return range ? range.start.getTime() : null;
}
