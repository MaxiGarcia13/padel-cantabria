import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

async function fetchTeamPhases(teamId: number): Promise<string[]> {
  const body = await request(`/api/team/${teamId}/phases`).json<{
    phases: string[];
  }>('Failed to load phases');

  return body.phases;
}

export function useTeamPhases(
  teamId: MaybeRefOrGetter<number>,
  initialData?: string[],
) {
  const queryKey = computed(() => ['team-phases', toValue(teamId)] as const);

  return useQuery({
    queryKey,
    queryFn: () => fetchTeamPhases(toValue(teamId)),
    // Relative /api fetches have no origin in Node; rely on initialData during SSR.
    enabled: computed(() => !import.meta.env.SSR),
    staleTime: 24 * 60 * 60 * 1000,
    initialData,
    initialDataUpdatedAt: initialData != null ? Date.now() : undefined,
  });
}
