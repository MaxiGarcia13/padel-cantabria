import type { League, Team } from '@padel-cantabria/database';
import type { TeamStandingAndNextMatch } from '@padel-cantabria/shared';
import {
  getPhaseOptions,
  getTeamDisplayLabels,
} from '@padel-cantabria/shared';
import { computed, ref, watch } from 'vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPhases } from '@/composables/use-team-phases';
import { useTeamPlayers } from '@/composables/use-team-players';
import { useTeamSummary } from '@/composables/use-team-summary';
import { buildCategoryPath } from '@/routes';

export function useTeamPage(options: {
  team: Team;
  leagues: League[];
  initialPhases: string[];
  initialSummary: TeamStandingAndNextMatch | null;
}) {
  const selectedPhase = ref(options.initialPhases[0] ?? '');
  const { data: phases, isPending: isPhasesPending } = useTeamPhases(
    options.team.id,
    options.initialPhases,
  );

  watch(
    phases,
    (phaseList) => {
      if (!phaseList?.length) {
        return;
      }

      if (!selectedPhase.value || !phaseList.includes(selectedPhase.value)) {
        selectedPhase.value = phaseList[0];
      }
    },
    { immediate: true },
  );

  const {
    data: summary,
    isPending: isSummaryPending,
    isError,
  } = useTeamSummary(
    options.team.id,
    selectedPhase,
    options.initialSummary && options.initialPhases[0]
      ? { phase: options.initialPhases[0], data: options.initialSummary }
      : undefined,
  );

  const isHydrated = useHydrated();
  const { data: teamPlayers } = useTeamPlayers(options.team.id);

  const totalPoints = computed(() => {
    const players = teamPlayers.value?.players;

    if (!isHydrated.value || !players) {
      return null;
    }

    return players.reduce((sum, player) => sum + player.points, 0);
  });

  const displayLabels = getTeamDisplayLabels(options.leagues, options.team);

  const phaseOptions = computed(() =>
    getPhaseOptions(
      options.leagues,
      options.team.league_id,
      options.team.gender,
      phases.value ?? options.initialPhases,
    ),
  );

  const categoryKey = computed(() => ({
    league_id: options.team.league_id,
    gender: options.team.gender,
    phase: selectedPhase.value,
    category: options.team.category,
  }));

  const standingsHref = computed(() =>
    selectedPhase.value ? buildCategoryPath(categoryKey.value) : '#',
  );

  const calendarHref = computed(() => {
    if (!selectedPhase.value) {
      return '#';
    }

    const params = new URLSearchParams({ team: String(options.team.id) });

    return `${buildCategoryPath(categoryKey.value)}/calendar?${params}`;
  });

  const errorMessage = computed(() =>
    isError.value ? 'No se pudo cargar la información del equipo' : null,
  );

  const isPending = computed(
    () =>
      isPhasesPending.value
      || (Boolean(selectedPhase.value) && isSummaryPending.value),
  );

  return {
    selectedPhase,
    summary,
    totalPoints,
    displayLabels,
    phaseOptions,
    standingsHref,
    calendarHref,
    errorMessage,
    isPending,
  };
}
