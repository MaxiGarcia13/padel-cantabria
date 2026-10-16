export function formatStandingValue(value: number | null): string {
  if (value === null) {
    return '—';
  }

  return String(value);
}
