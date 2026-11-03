import { isRecord } from '@chat/utils/parse-tool-json.js';

export function isLeagueTree(value: unknown): value is unknown[] {
  if (!Array.isArray(value) || value.length === 0) {
    return false;
  }

  return value.every((entry) => {
    if (!isRecord(entry)) {
      return false;
    }
    return Array.isArray(entry.genders)
      && (typeof entry.league === 'string' || entry.league === undefined);
  });
}
