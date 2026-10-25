import type { MaybeRefOrGetter } from 'vue';
import { getTeamTotalPoints } from '@padel-cantabria/shared';
import { computed } from 'vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPlayers } from '@/composables/use-team-players';

export function useTeamTotalPoints(teamId: MaybeRefOrGetter<number>) {
  const isHydrated = useHydrated();
  const { data: teamPlayers, isPending, isError } = useTeamPlayers(teamId);

  const points = computed(() => {
    const players = teamPlayers.value?.players;

    if (!isHydrated.value || !players) {
      return null;
    }

    return getTeamTotalPoints(players);
  });

  return {
    points,
    isPending: computed(() => !isHydrated.value || isPending.value),
    isError,
  };
}
