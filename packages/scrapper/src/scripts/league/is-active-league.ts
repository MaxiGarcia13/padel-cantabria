import type { BaseLeague } from '@padel-cantabria/database';

const END_DATE_OFFSET_MONTHS = 1;

function parseIsoDate(isoDate: string): Date {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function addMonths(isoDate: string, months: number): string {
  const date = parseIsoDate(isoDate);
  date.setMonth(date.getMonth() + months);

  return formatIsoDate(date);
}

export function isActiveLeague(
  league: BaseLeague,
  today: Date = new Date(),
): boolean {
  const todayIso = formatIsoDate(today);
  const endWithOffset = addMonths(
    league.schedule.end_date,
    END_DATE_OFFSET_MONTHS,
  );

  return (
    todayIso >= league.schedule.start_date && todayIso <= endWithOffset
  );
}
