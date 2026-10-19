import type { CategoryKey, TeamStandings } from '@padel-cantabria/database';

export interface RawCalendarMatch {
  id: number | null;
  home_team: string | null;
  away_team: string | null;
  date: string | null;
  status: string | null;
  location: string | null;
  rounds: string | null;
}

export type RawCalendarCell = Omit<
  RawCalendarMatch,
  'date' | 'location' | 'rounds'
> & {
  lines: string[];
};

export interface ScrapedCalendarMatch extends CategoryKey {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  status: string | null;
  location: string | null;
  rounds: string | null;
}

export type RawStandingRow = {
  id: number | null;
  name: string | null;
} & {
  [K in keyof Omit<TeamStandings, 'previous_position'>]: number | null;
};

export type ScrapedTeamStanding = {
  id: number;
  name: string;
} & Omit<TeamStandings, 'previous_position'>;
