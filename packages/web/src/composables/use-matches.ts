import type { CategoryKey, Match } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { categorySearchParams } from '@/routes';
import { request } from '@/utils/request';

async function fetchMatches(
  category: CategoryKey,
  teamId?: number,
): Promise<Match[]> {
  const params = categorySearchParams(category);

  if (teamId != null) {
    params.set('team', String(teamId));
  }

  return request(`/api/matches?${params}`).json<Match[]>(
    'Failed to load matches',
  );
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
