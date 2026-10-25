export function parseFederationInteger(
  value: string | null | undefined,
): number | null {
  const trimmed = value?.trim() ?? '';

  if (trimmed.length === 0 || trimmed === '--') {
    return null;
  }

  const normalized = trimmed.replace(/\./g, '');
  const parsed = Number(normalized);

  return Number.isFinite(parsed) ? parsed : null;
}
