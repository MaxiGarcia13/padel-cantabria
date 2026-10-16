import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchTeamPhases(teamId: number): Promise<string[]> {
  const response = await fetch(`/api/team/${teamId}/phases`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'Failed to load phases');
  }

  const body = (await response.json()) as { phases: string[] };

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
