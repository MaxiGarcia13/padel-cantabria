import type {
  TeamCoupleStats,
  TeamPlayerWithMatchStats,
} from '@padel-cantabria/shared';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

export interface TeamPlayersPayload {
  players: TeamPlayerWithMatchStats[];
  couples: TeamCoupleStats[];
}

async function fetchTeamPlayers(teamId: number): Promise<TeamPlayersPayload> {
  return request(`/api/team/${teamId}/players`).json<TeamPlayersPayload>(
    'Failed to load players',
  );
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
