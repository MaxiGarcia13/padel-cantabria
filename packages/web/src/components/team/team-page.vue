<script setup lang="ts">
import type { League, Team } from '@padel-cantabria/database';
import type { TeamSummaryResponse } from '@/types/team-summary';
import { computed, ref, watch } from 'vue';
import Select from '@/components/select.vue';
import TotalPoints from '@/components/total-points.vue';
import { useTeamPhases } from '@/composables/use-team-phases';
import { useTeamPlayers } from '@/composables/use-team-players';
import { useTeamSummary } from '@/composables/use-team-summary';
import {
  getPhaseOptions,
  getTeamDisplayLabels,
} from '@/domain/team/get-team-display-labels';
import { buildCategoryPath } from '@/server/load-category-matches';
import TeamCardSkeleton from './team-card-skeleton.vue';
import TeamNextMatchCard from './team-next-match-card.vue';
import TeamPlayersTableLazy from './team-players-table-lazy.vue';
import TeamStandingCard from './team-standing-card.vue';

const props = defineProps<{
  team: Team;
  leagues: League[];
  initialPhases: string[];
  initialSummary: TeamSummaryResponse | null;
}>();

const selectedPhase = ref(props.initialPhases[0] ?? '');
const { data: phases, isPending: isPhasesPending } = useTeamPhases(
  props.team.id,
  props.initialPhases,
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
  props.team.id,
  selectedPhase,
  props.initialSummary && props.initialPhases[0]
    ? { phase: props.initialPhases[0], data: props.initialSummary }
    : undefined,
);

const { data: players } = useTeamPlayers(props.team.id);

const totalPoints = computed(() => {
  if (!players.value) {
    return null;
  }

  return players.value.reduce((sum, player) => sum + player.points, 0);
});

const displayLabels = computed(() =>
  getTeamDisplayLabels(props.leagues, props.team),
);

const phaseOptions = computed(() =>
  getPhaseOptions(
    props.leagues,
    props.team,
    phases.value ?? props.initialPhases,
  ),
);

const categoryKey = computed(() => ({
  league_id: props.team.league_id,
  gender: props.team.gender,
  phase: selectedPhase.value,
  category: props.team.category,
}));

const standingsHref = computed(() =>
  selectedPhase.value ? buildCategoryPath(categoryKey.value) : '#',
);

const calendarHref = computed(() => {
  if (!selectedPhase.value) {
    return '#';
  }

  const params = new URLSearchParams({ team: String(props.team.id) });

  return `${buildCategoryPath(categoryKey.value)}/calendar?${params}`;
});

const errorMessage = computed(() =>
  isError.value ? 'No se pudo cargar la información del equipo' : null,
);

const isPending = computed(
  () => isPhasesPending.value || (Boolean(selectedPhase.value) && isSummaryPending.value),
);
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-4">
      <div class="flex items-center justify-between gap-4 sm:items-start">
        <h1 class="text-2xl font-semibold tracking-tight text-foreground">
          {{ team.name }}
        </h1>
        <TotalPoints :points="totalPoints" />
      </div>

      <dl class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
        <div class="flex gap-2">
          <dt class="text-muted">
            Categoría
          </dt>
          <dd class="font-medium text-foreground">
            {{ displayLabels.categoryLabel }}
          </dd>
        </div>
        <div class="flex gap-2">
          <dt class="text-muted">
            Género
          </dt>
          <dd class="font-medium text-foreground">
            {{ displayLabels.genderLabel }}
          </dd>
        </div>
      </dl>
    </header>

    <div class="w-full max-w-xs">
      <Select
        id="team-phase"
        :model-value="selectedPhase"
        label="Fase"
        :options="phaseOptions"
        :disabled="phaseOptions.length === 0"
        @update:model-value="selectedPhase = $event"
      />
    </div>

    <p
      v-if="errorMessage"
      class="text-sm text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-else-if="!isPending && phaseOptions.length === 0"
      class="text-sm text-muted"
    >
      No hay fases disponibles para este equipo.
    </p>

    <template v-else-if="selectedPhase">
      <div
        v-if="isPending"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <TeamCardSkeleton />
        <TeamCardSkeleton />
      </div>

      <div
        v-else
        class="grid grid-cols-1 gap-4 sm:grid-cols-2"
      >
        <TeamStandingCard
          :standing="summary?.standing ?? null"
          :standings-href="standingsHref"
        />
        <TeamNextMatchCard
          :match="summary?.nextMatch ?? null"
          :calendar-href="calendarHref"
        />
      </div>
    </template>

    <TeamPlayersTableLazy :team-id="team.id" />
  </div>
</template>
