export function parseLeagueIds(raw: string | undefined): Set<number> | null {
  if (!raw?.trim()) {
    return null;
  }

  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id));

  return ids.length > 0 ? new Set(ids) : null;
}
