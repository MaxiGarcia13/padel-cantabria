import type { League, MatchWrite } from '@padel-cantabria/database';
import type { WeekendRange } from '@padel-cantabria/shared';
import type { ResultCandidate } from './types.js';
import {
  getActiveWeekendRange,
  getMatchSortTime,
} from '@padel-cantabria/shared';

const DAY_MS = 24 * 60 * 60 * 1000;

function shiftWeekend(range: WeekendRange, weeks: number): WeekendRange {
  const offset = weeks * 7 * DAY_MS;

  return {
    start: range.start + offset,
    end: range.end + offset,
  };
}

function isInWeekendRanges(
  sortTime: number,
  ranges: WeekendRange[],
): boolean {
  return ranges.some(
    (range) => sortTime >= range.start && sortTime < range.end,
  );
}

export function selectResultCandidates(
  matches: MatchWrite[],
  leagues: League[],
  now = new Date(),
): ResultCandidate[] {
  const seasonByLeagueId = new Map(
    leagues.map((league) => [
      league.league_id,
      {
        start_date: league.schedule.start_date,
        end_date: league.schedule.end_date,
      },
    ]),
  );

  const activeWeekend = getActiveWeekendRange(now);
  const weekendRanges = [
    shiftWeekend(activeWeekend, -1),
    activeWeekend,
  ];
  const nowMs = now.getTime();

  return matches.flatMap((match) => {
    const season = seasonByLeagueId.get(match.league_id);

    if (!season) {
      return [];
    }

    const sortTime = getMatchSortTime(match.date, season);

    if (
      sortTime === null
      || sortTime > nowMs
      || !isInWeekendRanges(sortTime, weekendRanges)
    ) {
      return [];
    }

    return [
      {
        league_id: match.league_id,
        gender: match.gender,
        phase: match.phase,
        category: match.category,
        match_id: match.id,
        date: match.date,
      },
    ];
  });
}
