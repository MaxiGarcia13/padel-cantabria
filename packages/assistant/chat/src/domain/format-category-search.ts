import { isRecord, parseToolJson } from '../utils/parse-tool-json';
import { joinDisplayParts, stringField } from './tool-result-fallback/join-display-parts';

export function formatCategorySearchResults(toolText: string): string {
  const parsed = parseToolJson(toolText);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return 'No hay categorías que coincidan.';
  }

  const lines: string[] = [];

  for (const entry of parsed) {
    if (!isRecord(entry)) {
      continue;
    }

    const label = joinDisplayParts([
      stringField(entry, 'category'),
      stringField(entry, 'gender') || null,
      stringField(entry, 'phase') || null,
    ]);

    if (label) {
      lines.push(`- ${label}`);
    }
  }

  return lines.length > 0
    ? lines.join('\n')
    : 'No hay categorías que coincidan.';
}
