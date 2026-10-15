export interface League {
  league_id: number;
  name: string;
  schedule: {
    start_date: string;
    end_date: string;
  };
}
