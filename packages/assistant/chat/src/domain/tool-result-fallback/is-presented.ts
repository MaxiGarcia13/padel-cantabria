import type {
  PresentedCategory,
  PresentedCategoryTeams,
  PresentedPlayerLike,
  PresentedStandingTeam,
  PresentedTeamRoster,
} from '@presenters/presented-types';
import { isRecord } from '@/utils/parse-tool-json';

export function isPresentedCategory(
  value: unknown,
): value is PresentedCategory {
  return isRecord(value)
    && typeof value.category === 'string'
    && typeof value.category_value === 'string';
}

export function isPresentedStandingTeam(
  value: unknown,
): value is PresentedStandingTeam {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.id === 'number';
}

export function isPresentedCategoryTeams(
  value: unknown,
): value is PresentedCategoryTeams {
  return isRecord(value)
    && typeof value.category === 'string'
    && Array.isArray(value.teams);
}

export function isPresentedPlayerLike(
  value: unknown,
): value is PresentedPlayerLike {
  return isRecord(value)
    && typeof value.name === 'string'
    && typeof value.surname === 'string';
}

export function isPresentedTeamRoster(
  value: unknown,
): value is PresentedTeamRoster {
  return isRecord(value)
    && isRecord(value.team)
    && typeof value.team.name === 'string'
    && Array.isArray(value.players)
    && isRecord(value.totals);
}
