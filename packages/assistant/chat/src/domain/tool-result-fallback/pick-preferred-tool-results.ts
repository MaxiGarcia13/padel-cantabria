import { isRecord, parseToolJson } from '@/utils/parse-tool-json';

function isRosterOrTeamsPayload(text: string): boolean {
  const parsed = parseToolJson(text);
  return (
    isRecord(parsed)
    && (Array.isArray(parsed.players) || Array.isArray(parsed.teams))
  );
}

/**
 * Prefer roster / teams payloads (all of them, for multi-team compares).
 * Falls back to the full tool-result list when none match.
 */
export function pickPreferredToolResults(toolResults: string[]): string[] {
  const preferred = toolResults.filter(isRosterOrTeamsPayload);
  return preferred.length > 0 ? preferred : toolResults;
}
