<script setup lang="ts">
import type { League, Team } from '@padel-cantabria/database';
import type { TeamStandingAndNextMatch } from '@padel-cantabria/shared';
import Select from '@/components/select.vue';
import TeamCardSkeleton from './team-card-skeleton.vue';
import TeamNextMatchCard from './team-next-match-card.vue';
import TeamPageHeader from './team-page-header.vue';
import TeamPlayersTableLazy from './team-players-table-lazy.vue';
import TeamStandingCard from './team-standing-card.vue';
import { useTeamPage } from './use-team-page';

const props = defineProps<{
  team: Team;
  leagues: League[];
  phase: string;
  initialPhases: string[];
  initialSummary: TeamStandingAndNextMatch | null;
}>();

const {
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
} = useTeamPage(props);
</script>

<template>
  <div class="flex flex-col gap-8">
    <TeamPageHeader
      :team-name="team.name"
      :total-points="totalPoints"
      :display-labels="displayLabels"
    />

    <div class="w-full max-w-xs">
      <Select
        id="team-phase"
        :model-value="phase"
        label="Fase"
        :options="phaseOptions"
        :disabled="phaseOptions.length === 0"
        @update:model-value="onPhaseChange"
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

    <template v-else-if="phase">
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

    <TeamPlayersTableLazy
      :team-id="team.id"
      :category="categoryKey"
    />
  </div>
</template>
