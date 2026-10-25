import { formatNumber } from '../format/format-number.js';

export function formatWinAverage(average: number | null): string {
  if (average === null) {
    return '—';
  }

  return `${formatNumber(Math.round(average * 100))} %`;
}
