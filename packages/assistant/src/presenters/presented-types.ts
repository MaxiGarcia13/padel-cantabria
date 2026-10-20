import type { presentCategory } from './present-category.js';
import type {
  presentPlayer,
  presentRosterTotals,
  presentTeamPlayer,
} from './present-player.js';
import type {
  presentCategoryTeams,
  presentTeam,
} from './present-team.js';

export type PresentedCategory = ReturnType<typeof presentCategory>;
export type PresentedPlayer = ReturnType<typeof presentPlayer>;
export type PresentedTeamPlayer = ReturnType<typeof presentTeamPlayer>;
export type PresentedRosterTotals = ReturnType<typeof presentRosterTotals>;
export type PresentedTeam = ReturnType<typeof presentTeam>;
export type PresentedCategoryTeams = ReturnType<typeof presentCategoryTeams>;
export type PresentedStandingTeam = PresentedCategoryTeams['teams'][number];

export interface PresentedTeamRoster {
  team: PresentedTeam;
  players: PresentedTeamPlayer[];
  totals: PresentedRosterTotals;
}

export type PresentedPlayerLike = PresentedPlayer | PresentedTeamPlayer;
