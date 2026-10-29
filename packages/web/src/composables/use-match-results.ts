import type { CategoryKey } from '@padel-cantabria/database';
import type { MatchResultSummary } from '@padel-cantabria/shared';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { categorySearchParams } from '@/routes';
import { request } from '@/utils/request';

export type MatchResultsById = Record<string, MatchResultSummary>;

async function fetchMatchResults(
  category: CategoryKey,
  matchIds: number[],
): Promise<MatchResultsById> {
  if (matchIds.length === 0) {
    return {};
  }

  const params = categorySearchParams(category);
  params.set('ids', matchIds.join(','));

  return request(`/api/match-results?${params}`).json<MatchResultsById>(
    'Failed to load match results',
  );
}

export function useMatchResults(
  category: MaybeRefOrGetter<CategoryKey>,
  matchIds: MaybeRefOrGetter<number[]>,
) {
  const queryKey = computed(() => {
    const value = toValue(category);
    const ids = [
      ...toValue(matchIds),
    ].sort((left, right) => left - right);

    return [
      'match-results',
      value.league_id,
      value.gender,
      value.phase,
      value.category,
      ids.join(','),
    ] as const;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchMatchResults(toValue(category), toValue(matchIds)),
    enabled: computed(() => toValue(matchIds).length > 0),
    staleTime: 1000 * 60 * 5,
  });
}
