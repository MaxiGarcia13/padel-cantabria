import type { CategoryKey } from '@padel-cantabria/database';

export interface RawCalendarMatch {
  id: number | null;
  home_team: string | null;
  away_team: string | null;
  date: string | null;
  status: string | null;
  location: string | null;
  schedule: string | null;
}

export interface ScrapedCalendarMatch extends CategoryKey {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  status: string | null;
  location: string | null;
  schedule: string | null;
}
