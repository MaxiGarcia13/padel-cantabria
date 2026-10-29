import type { League, Team } from '@padel-cantabria/database';
import type { TeamStandingAndNextMatch } from '@padel-cantabria/shared';
import {
  getPhaseOptions,
  getTeamDisplayLabels,
} from '@padel-cantabria/shared';
import { navigate } from 'astro:transitions/client';
import { computed, toRef } from 'vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPhases } from '@/composables/use-team-phases';
import { useTeamPlayers } from '@/composables/use-team-players';
import { useTeamSummary } from '@/composables/use-team-summary';
import { buildCategoryPath, buildTeamPath, teamCategoryKey } from '@/routes';

export function useTeamPage(options: {
  team: Team;
  leagues: League[];
  phase: string;
  initialPhases: string[];
  initialSummary: TeamStandingAndNextMatch | null;
}) {
  const phase = toRef(options, 'phase');
  const { data: phases, isPending: isPhasesPending } = useTeamPhases(
    options.team.id,
    options.initialPhases,
  );

  const categoryKey = computed(() =>
    teamCategoryKey(options.team, phase.value),
  );

  const {
    data: summary,
    isPending: isSummaryPending,
    isError,
  } = useTeamSummary(
    options.team.id,
    categoryKey,
    options.initialSummary
      ? {
          category: teamCategoryKey(options.team, options.phase),
          data: options.initialSummary,
        }
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

  const standingsHref = computed(() =>
    phase.value
      ? buildCategoryPath(categoryKey.value)
      : '#',
  );

  const calendarHref = computed(() => {
    if (!phase.value) {
      return '#';
    }

    const params = new URLSearchParams({
      team: String(options.team.id),
    });

    return `${buildCategoryPath(categoryKey.value)}/calendar?${params}`;
  });

  const errorMessage = computed(() =>
    isError.value ? 'No se pudo cargar la información del equipo' : null,
  );

  const isPending = computed(
    () =>
      isPhasesPending.value
      || (Boolean(phase.value) && isSummaryPending.value),
  );

  function onPhaseChange(nextPhase: string): void {
    if (!nextPhase || nextPhase === phase.value) {
      return;
    }

    void navigate(
      buildTeamPath(teamCategoryKey(options.team, nextPhase), options.team.id),
    );
  }

  return {
    phase,
    categoryKey,
    summary,
    totalPoints,
    displayLabels,
    phaseOptions,
    standingsHref,
    calendarHref,
    errorMessage,
    isPending,
    onPhaseChange,
  };
}
