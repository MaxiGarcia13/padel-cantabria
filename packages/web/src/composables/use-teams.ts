import type { CategoryKey, TeamWithStandings } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

async function fetchTeams(
  category: CategoryKey,
): Promise<TeamWithStandings[]> {
  const params = new URLSearchParams({
    league: String(category.league_id),
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });

  return request(`/api/teams?${params}`).json<TeamWithStandings[]>(
    'Failed to load teams',
  );
}

export function useTeams(category: MaybeRefOrGetter<CategoryKey>) {
  const queryKey = computed(() => {
    const value = toValue(category);

    return [
      'teams',
      value.league_id,
      value.gender,
      value.phase,
      value.category,
    ] as const;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchTeams(toValue(category)),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
