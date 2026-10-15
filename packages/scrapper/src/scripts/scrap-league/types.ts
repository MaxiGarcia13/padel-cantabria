export interface RawLeague {
  league_id: number | null;
  name: string | null;
  schedule: string | null;
}

export interface League {
  league_id: number;
  name: string;
  schedule: {
    start_date: string;
    end_date: string;
  };
}
