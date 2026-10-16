import type { CategoryKey, Match } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchMatches(category: CategoryKey): Promise<Match[]> {
  const params = new URLSearchParams({
    league: String(category.league_id),
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });
  const response = await fetch(`/api/matches?${params}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'Failed to load matches');
  }

  return response.json() as Promise<Match[]>;
}

export function useMatches(category: MaybeRefOrGetter<CategoryKey>) {
  const queryKey = computed(() => {
    const value = toValue(category);

    return [
      'matches',
      value.league_id,
      value.gender,
      value.phase,
      value.category,
    ] as const;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchMatches(toValue(category)),
    staleTime: 1000 * 60 * 5,
  });
}
