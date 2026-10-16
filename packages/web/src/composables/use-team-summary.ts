import type { MaybeRefOrGetter } from 'vue';
import type { TeamSummaryResponse } from '@/types/team-summary';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchTeamSummary(
  teamId: number,
  phase: string,
): Promise<TeamSummaryResponse> {
  const params = new URLSearchParams({ phase });
  const response = await fetch(`/api/team/${teamId}/summary?${params}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'No se pudo cargar el resumen del equipo');
  }

  return response.json() as Promise<TeamSummaryResponse>;
}

export function useTeamSummary(
  teamId: MaybeRefOrGetter<number>,
  phase: MaybeRefOrGetter<string>,
) {
  const queryKey = computed(
    () => ['team-summary', toValue(teamId), toValue(phase)] as const,
  );

  return useQuery({
    queryKey,
    queryFn: () => fetchTeamSummary(toValue(teamId), toValue(phase)),
    enabled: computed(() => toValue(phase).trim().length > 0),
    staleTime: 1000 * 60 * 5,
  });
}
