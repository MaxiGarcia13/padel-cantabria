export interface TeamStandings {
  position: number | null;
  previous_position: number | null;
  confrontations_played: number | null;
  points: number | null;
  matches_played: number | null;
  matches_won: number | null;
  sets_for: number | null;
  sets_against: number | null;
  sets_average: number | null;
  games_for: number | null;
  games_against: number | null;
  games_average: number | null;
}

export interface Team extends TeamStandings {
  id: number;
  league_id: number;
  gender: string;
  category: string;
  name: string;
}

export const EMPTY_TEAM_STANDINGS: TeamStandings = {
  position: null,
  previous_position: null,
  confrontations_played: null,
  points: null,
  matches_played: null,
  matches_won: null,
  sets_for: null,
  sets_against: null,
  sets_average: null,
  games_for: null,
  games_against: null,
  games_average: null,
};
