export interface CategoryKey {
  league_id: number;
  gender: string;
  phase: string;
  category: string;
}

export interface Match extends CategoryKey {
  id: number;
  home_team_id: number;
  away_team_id: number;
  home_team: string;
  away_team: string;
  date: string;
  status: string | null;
  location: string | null;
  rounds: string | null;
}

/** Shape used when writing matches (team names come from the teams table). */
export type MatchWrite = Omit<Match, 'home_team' | 'away_team'>;
