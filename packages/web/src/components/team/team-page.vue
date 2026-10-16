<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import { computed, ref, watch } from 'vue';
import Select from '@/components/select.vue';
import { useLeagues } from '@/composables/use-leagues';
import { useTeamPhases } from '@/composables/use-team-phases';
import { useTeamSummary } from '@/composables/use-team-summary';
import {
  getPhaseOptions,
  getTeamDisplayLabels,
} from '@/domain/team/get-team-display-labels';
import { buildCategoryPath } from '@/server/load-category-matches';
import TeamNextMatchCard from './team-next-match-card.vue';
import TeamStandingCard from './team-standing-card.vue';

const props = defineProps<{
  team: Team;
  initialPhases: string[];
}>();

const selectedPhase = ref(props.initialPhases[0] ?? '');
const { data: leagues } = useLeagues();
const { data: phases, isPending: isPhasesPending } = useTeamPhases(props.team.id);

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
  error,
} = useTeamSummary(props.team.id, selectedPhase);

const displayLabels = computed(() =>
  getTeamDisplayLabels(leagues.value, props.team),
);

const phaseOptions = computed(() =>
  getPhaseOptions(
    leagues.value,
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

const calendarHref = computed(() =>
  selectedPhase.value ? `${buildCategoryPath(categoryKey.value)}/calendar` : '#',
);

const errorMessage = computed(() => {
  if (!isError.value) {
    return null;
  }

  return error.value instanceof Error
    ? error.value.message
    : 'Error inesperado';
});

const isPending = computed(
  () => isPhasesPending.value || (Boolean(selectedPhase.value) && isSummaryPending.value),
);
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-4">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ team.name }}
      </h1>

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

    <Select
      id="team-phase"
      class="max-w-xs"
      :model-value="selectedPhase"
      label="Fase"
      :options="phaseOptions"
      :disabled="phaseOptions.length === 0"
      @update:model-value="selectedPhase = $event"
    />

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
        class="grid gap-4 lg:grid-cols-2"
      >
        <div class="h-48 animate-pulse rounded-xl border border-border bg-surface" />
        <div class="h-48 animate-pulse rounded-xl border border-border bg-surface" />
      </div>

      <div
        v-else
        class="grid gap-4 lg:grid-cols-2"
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
  </div>
</template>
