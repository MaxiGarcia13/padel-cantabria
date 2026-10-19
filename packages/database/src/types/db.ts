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
  gender: string;
};

export type CategoryRecord = SelectOption & {
  league_id: number;
  gender: string;
  phase: string;
};

export interface TeamRecord {
  id: number;
  league_id: number;
  gender: string;
  category: string;
  name: string;
}

export interface MatchRecord {
  league_id: number;
  gender: string;
  phase: string;
  category: string;
  id: number;
  home_team_id: number;
  away_team_id: number;
  date: string;
  status: string | null;
  location: string | null;
  rounds: string | null;
}
