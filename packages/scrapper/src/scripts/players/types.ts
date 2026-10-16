export interface RawPlayerRow {
  position: string | null;
  surname1: string | null;
  surname2: string | null;
  name: string | null;
  points: string | null;
}

export interface ScrapedPlayer {
  position: number;
  surname: string;
  name: string;
  points: number;
}
