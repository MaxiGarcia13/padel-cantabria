export interface CategoryKey {
  league_id: number;
  gender_value: string;
  phase_value: string;
  category_value: string;
}

export interface Match extends CategoryKey {
  partido_id: number;
  home_team: string;
  away_team: string;
  date_label: string;
  status: string | null;
}
