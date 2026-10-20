export function normalizeGender(
  value: string | undefined,
): 'M' | 'F' | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (normalized === 'm' || normalized.startsWith('masc')) {
    return 'M';
  }

  if (normalized === 'f' || normalized.startsWith('fem')) {
    return 'F';
  }

  return undefined;
}
