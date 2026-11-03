export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function parseToolJson(toolText: string): unknown {
  try {
    return JSON.parse(toolText) as unknown;
  } catch {
    return null;
  }
}

export function toolResultsIncludeTeams(toolResults: string[]): boolean {
  return toolResults.some((text) => {
    const parsed = parseToolJson(text);
    return isRecord(parsed) && Array.isArray(parsed.teams);
  });
}
