export interface BaseLeague {
  league_id: number;
  name: string;
  schedule: {
    start_date: string;
    end_date: string;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface Phase extends SelectOption {
  categories: SelectOption[];
}

export interface Gender extends SelectOption {
  phases: Phase[];
}

export interface League extends BaseLeague {
  genders: Gender[];
}
