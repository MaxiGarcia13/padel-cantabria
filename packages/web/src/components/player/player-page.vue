<script setup lang="ts">
import type { League, Team, TeamPlayer } from '@padel-cantabria/database';
import type { TeamPlayerPagePayload } from '@/types/team-player-page';
import { getTeamDisplayLabels } from '@padel-cantabria/shared';
import { computed } from 'vue';
import TeamCardSkeleton from '@/components/team/team-card-skeleton.vue';
import { useTeamPlayer } from '@/composables/use-team-player';
import PlayerHistoryList from './player-history-list.vue';
import PlayerPageHeader from './player-page-header.vue';
import PlayerPartnersTable from './player-partners-table.vue';
import PlayerSummaryCard from './player-summary-card.vue';

const props = defineProps<{
  team: Team;
  player: TeamPlayer;
  leagues: League[];
  initialPayload: TeamPlayerPagePayload | null;
}>();

const { data, isPending, isError } = useTeamPlayer(
  props.team.id,
  props.player.surname,
  props.player.name,
  props.initialPayload,
);

const displayLabels = getTeamDisplayLabels(props.leagues, props.team);

const stats = computed(() => data.value?.stats ?? null);

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar las estadísticas del jugador' : null,
);

const showSkeleton = computed(
  () => isPending.value && !props.initialPayload,
);
</script>

<template>
  <div class="flex flex-col gap-8">
    <PlayerPageHeader
      :player="player"
      :team-name="team.name"
      :team-id="team.id"
      :display-labels="displayLabels"
    />

    <p
      v-if="errorMessage"
      class="text-sm text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <template v-else>
      <TeamCardSkeleton v-if="showSkeleton" />

      <template v-else-if="stats">
        <PlayerSummaryCard :stats="stats" />

        <PlayerPartnersTable
          :partners="stats.partners"
          :team-id="team.id"
        />

        <PlayerHistoryList :courts="stats.recent_courts" />
      </template>
    </template>
  </div>
</template>
