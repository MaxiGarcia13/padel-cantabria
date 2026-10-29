import type { Match } from '@padel-cantabria/database';
import type { SeasonRange } from './parse-match-date/index.js';
import { sortMatchesByDate } from './get-closest-matches.js';

export interface MatchDateGroup {
  date: string;
  matches: Match[];
}

export function groupMatchesByDate(
  matches: Match[],
  season: SeasonRange,
): MatchDateGroup[] {
  const groups: MatchDateGroup[] = [];
  const indexByDate = new Map<string, number>();

  for (const match of sortMatchesByDate(matches, season)) {
    const existingIndex = indexByDate.get(match.date);

    if (existingIndex === undefined) {
      indexByDate.set(match.date, groups.length);
      groups.push({
        date: match.date,
        matches: [match],
      });
      continue;
    }

    groups[existingIndex]!.matches.push(match);
  }

  return groups;
}
