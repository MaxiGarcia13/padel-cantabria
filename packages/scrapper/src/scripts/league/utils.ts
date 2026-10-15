import type { League } from './types.js';

const SCHEDULE_PATTERN
  = /^Del\s+(\d{2})\/(\d{2})\/(\d{4})\s+al\s+(\d{2})\/(\d{2})\/(\d{4})$/i;

function toIsoDate(day: string, month: string, year: string): string {
  return `${year}-${month}-${day}`;
}

export function parseSchedule(rawSchedule: string): League['schedule'] {
  const match = rawSchedule.trim().match(SCHEDULE_PATTERN);

  if (!match) {
    throw new Error(`Invalid schedule format: "${rawSchedule}"`);
  }

  const [, startDay, startMonth, startYear, endDay, endMonth, endYear] = match;

  return {
    start_date: toIsoDate(startDay, startMonth, startYear),
    end_date: toIsoDate(endDay, endMonth, endYear),
  };
}
