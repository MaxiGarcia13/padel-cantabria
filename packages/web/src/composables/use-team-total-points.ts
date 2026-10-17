import type { MaybeRefOrGetter } from 'vue';
import { computed } from 'vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPlayers } from '@/composables/use-team-players';
import { getTeamTotalPoints } from '@/domain/team/get-team-total-points';

export function useTeamTotalPoints(teamId: MaybeRefOrGetter<number>) {
  const isHydrated = useHydrated();
  const { data: players, isPending, isError } = useTeamPlayers(teamId);

  const points = computed(() => {
    if (!isHydrated.value || !players.value) {
      return null;
    }

    return getTeamTotalPoints(players.value);
  });

  return {
    points,
    isPending: computed(() => !isHydrated.value || isPending.value),
    isError,
  };
}
