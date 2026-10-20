import type { TeamStandingAndNextMatch } from '@padel-cantabria/shared';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

async function fetchTeamSummary(
  teamId: number,
  phase: string,
): Promise<TeamStandingAndNextMatch> {
  const params = new URLSearchParams({ phase });

  return request(`/api/team/${teamId}/summary?${params}`).json<
    TeamStandingAndNextMatch
  >('Failed to load team summary');
}

export function useTeamSummary(
  teamId: MaybeRefOrGetter<number>,
  phase: MaybeRefOrGetter<string>,
  initial?: { phase: string; data: TeamStandingAndNextMatch },
) {
  const queryKey = computed(
    () => ['team-summary', toValue(teamId), toValue(phase)] as const,
  );

  const matchingInitialData = computed(() => {
    if (!initial || toValue(phase) !== initial.phase) {
      return undefined;
    }

    return initial.data;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchTeamSummary(toValue(teamId), toValue(phase)),
    // Relative /api fetches have no origin in Node; rely on initialData during SSR.
    enabled: computed(
      () => !import.meta.env.SSR && toValue(phase).trim().length > 0,
    ),
    staleTime: 1000 * 60 * 5,
    initialData: () => matchingInitialData.value,
    initialDataUpdatedAt: () =>
      matchingInitialData.value != null ? Date.now() : undefined,
  });
}
