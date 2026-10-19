import type { MatchRecord } from './db.js';

export type CategoryKey = Pick<
  MatchRecord,
  'league_id' | 'gender' | 'phase' | 'category'
>;

/** Shape used when writing matches (team names come from the teams table). */
export type MatchWrite = MatchRecord;

export type Match = MatchRecord & {
  home_team: string;
  away_team: string;
};
