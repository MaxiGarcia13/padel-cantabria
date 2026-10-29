export function parseGenders(raw: string | undefined): Set<string> | null {
  if (!raw?.trim()) {
    return null;
  }

  const genders = raw
    .split(',')
    .map((value) => value.trim())
    .filter((value) => value.length > 0);

  return genders.length > 0
    ? new Set(genders)
    : null;
}
