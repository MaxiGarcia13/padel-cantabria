import type { CategoryKey, Match } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchMatches(
  category: CategoryKey,
  teamId?: number,
): Promise<Match[]> {
  const params = new URLSearchParams({
    league: String(category.league_id),
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });

  if (teamId != null) {
    params.set('team', String(teamId));
  }

  const response = await fetch(`/api/matches?${params}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'Failed to load matches');
  }

  return response.json() as Promise<Match[]>;
}

export function useMatches(
  category: MaybeRefOrGetter<CategoryKey>,
  teamId?: MaybeRefOrGetter<number | undefined>,
) {
  const queryKey = computed(() => {
    const value = toValue(category);

    return [
      'matches',
      value.league_id,
      value.gender,
      value.phase,
      value.category,
      toValue(teamId) ?? null,
    ] as const;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchMatches(toValue(category), toValue(teamId)),
    staleTime: 1000 * 60 * 5,
  });
}
