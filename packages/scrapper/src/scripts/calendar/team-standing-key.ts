import type { CategoryKey } from '@padel-cantabria/database';

export function teamStandingKey(
  category: CategoryKey,
  teamId: number,
): string {
  return `${category.league_id}:${category.gender}:${category.phase}:${category.category}:${teamId}`;
}
