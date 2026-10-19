import { formatNumber } from '../format/format-number.js';

export function formatStandingValue(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return formatNumber(value);
}
