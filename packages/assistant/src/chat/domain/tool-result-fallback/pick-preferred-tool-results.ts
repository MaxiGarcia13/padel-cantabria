import { isRecord, parseToolJson } from '@chat/utils/parse-tool-json.js';

function isRosterOrTeamsPayload(text: string): boolean {
  const parsed = parseToolJson(text);
  return (
    isRecord(parsed)
    && (Array.isArray(parsed.players) || Array.isArray(parsed.teams))
  );
}

export function pickPreferredToolResults(toolResults: string[]): string[] {
  const preferred = toolResults.filter(isRosterOrTeamsPayload);
  return preferred.length > 0
    ? preferred
    : toolResults;
}
