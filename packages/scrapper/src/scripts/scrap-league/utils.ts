import type { League, SelectOption } from './types.js';

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

export function mergeSelectOptions(
  ...optionLists: SelectOption[][]
): SelectOption[] {
  const optionsByValue = new Map<string, SelectOption>();

  for (const optionList of optionLists) {
    for (const option of optionList) {
      if (!optionsByValue.has(option.value)) {
        optionsByValue.set(option.value, option);
      }
    }
  }

  return Array.from(optionsByValue.values());
}
