import type { MatchRecord } from './db.js';

export type CategoryKey = Pick<
  MatchRecord,
  'league_id' | 'gender' | 'phase' | 'category'
>;

export type MatchWrite = MatchRecord;

export type Match = MatchRecord & {
  home_team: string;
  away_team: string;
};
