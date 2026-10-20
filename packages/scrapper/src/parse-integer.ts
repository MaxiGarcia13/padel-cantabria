export function parseInteger(value: string | null | undefined): number | null {
  const trimmed = value?.trim() ?? '';

  if (trimmed.length === 0) {
    return null;
  }

  const parsed = Number(trimmed);

  return Number.isFinite(parsed) ? parsed : null;
}
