export interface CategoryKey {
  league_id: number;
  gender_value: string;
  phase_value: string;
  category_value: string;
}

export interface Match extends CategoryKey {
  id: number;
  home_team: string;
  away_team: string;
  date: string;
  status: string | null;
  location: string | null;
  schedule: string | null;
}
