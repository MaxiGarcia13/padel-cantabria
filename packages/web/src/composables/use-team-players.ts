import type { TeamPlayerWithMatchStats } from '@padel-cantabria/shared';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

async function fetchTeamPlayers(
  teamId: number,
): Promise<TeamPlayerWithMatchStats[]> {
  const body = await request(`/api/team/${teamId}/players`).json<{
    players: TeamPlayerWithMatchStats[];
  }>('Failed to load players');

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
