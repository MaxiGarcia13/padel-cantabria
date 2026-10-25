const DAY_MS = 24 * 60 * 60 * 1000;

export interface WeekendRange {
  start: number;
  end: number;
}

function startOfLocalDayUtc(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

function startOfUtcDay(timeMs: number): number {
  const date = new Date(timeMs);
  return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
}

function fridayToMondayRange(fridayStart: number): WeekendRange {
  return {
    start: fridayStart,
    end: fridayStart + 3 * DAY_MS,
  };
}

export function getActiveWeekendRange(now = new Date()): WeekendRange {
  const today = startOfLocalDayUtc(now);
  const day = now.getDay();

  let friday = today;

  if (day === 0) {
    friday = today - 2 * DAY_MS;
  } else if (day === 6) {
    friday = today - DAY_MS;
  } else if (day !== 5) {
    friday = today + (5 - day) * DAY_MS;
  }

  return fridayToMondayRange(friday);
}

export function getWeekendRangeContaining(timeMs: number): WeekendRange {
  const dayStart = startOfUtcDay(timeMs);
  const day = new Date(timeMs).getUTCDay();

  if (day >= 1 && day <= 4) {
    return {
      start: dayStart,
      end: dayStart + DAY_MS,
    };
  }

  let friday = dayStart;

  if (day === 0) {
    friday = dayStart - 2 * DAY_MS;
  } else if (day === 6) {
    friday = dayStart - DAY_MS;
  }

  return fridayToMondayRange(friday);
}
