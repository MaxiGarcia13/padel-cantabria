import type { SelectOption } from './league.js';

export interface LeagueRecord {
  id: number;
  name: string;
  start_date: string;
  end_date: string;
}

export type GenderRecord = SelectOption & {
  league_id: number;
};

export type PhaseRecord = SelectOption & {
  league_id: number;
  gender_value: string;
};

export type CategoryRecord = SelectOption & {
  league_id: number;
  gender_value: string;
  phase_value: string;
};

export interface MatchRecord {
  league_id: number;
  gender_value: string;
  phase_value: string;
  category_value: string;
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  status: string | null;
  location: string | null;
  schedule: string | null;
}
