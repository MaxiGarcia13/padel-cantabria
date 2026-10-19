<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { formatStandingValue } from '@padel-cantabria/shared';
import { computed, ref } from 'vue';
import { Tabs } from '@/components/tabs';
import TeamPlayersTableLazy from '@/components/team/team-players-table-lazy.vue';
import { useTeamTotalPoints } from '@/composables/use-team-total-points';
import MatchHeader from './match-header.vue';
import MatchMeta from './match-meta.vue';

const props = defineProps<{
  match: Match;
}>();

const selectedTeamId = ref(props.match.home_team_id);

const { points: homePoints } = useTeamTotalPoints(() => props.match.home_team_id);
const { points: awayPoints } = useTeamTotalPoints(() => props.match.away_team_id);

const teamOptions = computed(() => [
  {
    value: props.match.home_team_id,
    label: props.match.home_team,
    secondary: `${formatStandingValue(homePoints.value)} pts`,
  },
  {
    value: props.match.away_team_id,
    label: props.match.away_team,
    secondary: `${formatStandingValue(awayPoints.value)} pts`,
  },
]);
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-4">
      <MatchHeader
        :home-team="match.home_team"
        :away-team="match.away_team"
      />
      <MatchMeta :match="match" />
    </header>

    <Tabs
      v-model="selectedTeamId"
      :options="teamOptions"
    />

    <TeamPlayersTableLazy :team-id="selectedTeamId" />
  </div>
</template>
