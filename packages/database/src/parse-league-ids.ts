import process from 'node:process';

export function parseLeagueIds(raw: string | undefined): Set<number> | null {
  if (!raw?.trim()) {
    return null;
  }

  const ids = raw
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((id) => Number.isFinite(id));

  return ids.length > 0
    ? new Set(ids)
    : null;
}

// Assistant/MCP: first id in LEAGUE_IDS (required). Scrapers treat it as optional.
export function getConfiguredLeagueId(): number {
  const ids = parseLeagueIds(process.env.LEAGUE_IDS);

  if (!ids || ids.size === 0) {
    throw new Error(
      'LEAGUE_IDS is required in the root .env for the assistant/MCP (e.g. LEAGUE_IDS=28942)',
    );
  }

  return [...ids][0]!;
}
