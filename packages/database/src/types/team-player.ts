export interface TeamPlayer {
  team_id: number;
  position: number;
  previous_position: number | null;
  surname: string;
  name: string;
  points: number;
  previous_points: number | null;
}
