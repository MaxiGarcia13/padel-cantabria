/** Team identity (teams table). Standings live in team_standings per phase. */
export interface Team {
  id: number;
  league_id: number;
  gender: string;
  category: string;
  name: string;
}
