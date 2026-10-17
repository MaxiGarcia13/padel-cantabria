import { formatNumber } from '@/utils/format-number';

export function formatStandingValue(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return formatNumber(value);
}
