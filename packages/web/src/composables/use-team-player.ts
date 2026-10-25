import type { MaybeRefOrGetter } from 'vue';
import type { TeamPlayerPagePayload } from '@/types/team-player-page';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

async function fetchTeamPlayer(
  teamId: number,
  surname: string,
  name: string,
): Promise<TeamPlayerPagePayload> {
  const params = new URLSearchParams({ surname, name });

  return request(
    `/api/team/${teamId}/player?${params.toString()}`,
  ).json<TeamPlayerPagePayload>('Failed to load player');
}

export function useTeamPlayer(
  teamId: MaybeRefOrGetter<number>,
  surname: MaybeRefOrGetter<string>,
  name: MaybeRefOrGetter<string>,
  initialData?: TeamPlayerPagePayload | null,
) {
  const queryKey = computed(
    () =>
      [
        'team-player',
        toValue(teamId),
        toValue(surname),
        toValue(name),
      ] as const,
  );

  return useQuery({
    queryKey,
    queryFn: () =>
      fetchTeamPlayer(toValue(teamId), toValue(surname), toValue(name)),
    enabled: computed(() => !import.meta.env.SSR),
    initialData: initialData ?? undefined,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
