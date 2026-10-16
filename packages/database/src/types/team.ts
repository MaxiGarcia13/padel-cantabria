import type { CategoryKey } from './match.js';

export interface Team extends CategoryKey {
  id: number;
  name: string;
  confirmed: boolean;
}
