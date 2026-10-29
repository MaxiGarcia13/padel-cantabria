import type { CategoryKey } from '@padel-cantabria/database';
import type { TeamStandingAndNextMatch } from '@padel-cantabria/shared';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { categorySearchParams } from '@/routes';
import { request } from '@/utils/request';

async function fetchTeamSummary(
  teamId: number,
  category: CategoryKey,
): Promise<TeamStandingAndNextMatch> {
  const params = categorySearchParams(category);

  return request(`/api/team/${teamId}/summary?${params}`).json<
    TeamStandingAndNextMatch
  >('Failed to load team summary');
}

export function useTeamSummary(
  teamId: MaybeRefOrGetter<number>,
  category: MaybeRefOrGetter<CategoryKey>,
  initial?: { category: CategoryKey; data: TeamStandingAndNextMatch },
) {
  const queryKey = computed(() => {
    const value = toValue(category);

    return [
      'team-summary',
      toValue(teamId),
      value.league_id,
      value.gender,
      value.phase,
      value.category,
    ] as const;
  });

  const matchingInitialData = computed(() => {
    if (!initial) {
      return undefined;
    }

    const value = toValue(category);

    if (
      value.league_id !== initial.category.league_id
      || value.gender !== initial.category.gender
      || value.phase !== initial.category.phase
      || value.category !== initial.category.category
    ) {
      return undefined;
    }

    return initial.data;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchTeamSummary(toValue(teamId), toValue(category)),
    // Relative /api fetches have no origin in Node; rely on initialData during SSR.
    enabled: computed(
      () => !import.meta.env.SSR && toValue(category).phase.trim().length > 0,
    ),
    staleTime: 1000 * 60 * 5,
    initialData: () => matchingInitialData.value,
    initialDataUpdatedAt: () =>
      matchingInitialData.value != null
        ? Date.now()
        : undefined,
  });
}
