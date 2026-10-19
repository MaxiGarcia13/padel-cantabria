import { isRecord, parseToolJson } from '@/utils/parse-tool-json';

/** Prefer the last tool payload that already lists a roster or teams. */
export function pickPreferredToolResults(toolResults: string[]): string[] {
  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const text = toolResults[index]!;
    const parsed = parseToolJson(text);
    if (
      isRecord(parsed)
      && (Array.isArray(parsed.players) || Array.isArray(parsed.teams))
    ) {
      return [text];
    }
  }

  return toolResults;
}
