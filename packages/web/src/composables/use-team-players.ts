import type { TeamPlayer } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchTeamPlayers(teamId: number): Promise<TeamPlayer[]> {
  const response = await fetch(`/api/team/${teamId}/players`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'Failed to load players');
  }

  const body = (await response.json()) as { players: TeamPlayer[] };

  return body.players;
}

export function useTeamPlayers(teamId: MaybeRefOrGetter<number>) {
  const queryKey = computed(() => ['team-players', toValue(teamId)] as const);

  return useQuery({
    queryKey,
    queryFn: () => fetchTeamPlayers(toValue(teamId)),
    enabled: computed(() => !import.meta.env.SSR),
    staleTime: 24 * 60 * 60 * 1000,
  });
}
