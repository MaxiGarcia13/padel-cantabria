<script setup lang="ts">
import type { Match, MatchGame } from '@padel-cantabria/database';
import type { MatchResultSummary } from '@padel-cantabria/shared';
import { formatStandingValue } from '@padel-cantabria/shared';
import { computed, ref } from 'vue';
import TeamPlayersTableLazy from '@/components/team/team-players-table-lazy.vue';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useTeamTotalPoints } from '@/composables/use-team-total-points';
import MatchGames from './match-games.vue';
import MatchHeader from './match-header.vue';
import MatchMeta from './match-meta.vue';

const props = defineProps<{
  match: Match;
  result?: MatchResultSummary | null;
  games?: MatchGame[];
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

const isPlayed = Boolean(props.result?.is_played);
const games = props.games ?? [];
</script>

<template>
  <div class="flex flex-col gap-8">
    <header class="flex flex-col gap-4">
      <MatchHeader
        :home-team="match.home_team"
        :away-team="match.away_team"
        :result="result"
      />
      <MatchMeta :match="match" />
    </header>

    <MatchGames
      v-if="isPlayed"
      :games="games"
    />

    <Tabs v-model="selectedTeamId">
      <TabsList>
        <TabsTrigger
          v-for="option in teamOptions"
          :key="option.value"
          :value="option.value"
          class="overflow-hidden px-2 whitespace-normal"
        >
          <span class="flex w-full min-w-0 flex-col items-center text-center leading-tight">
            <span class="line-clamp-2 break-words">
              {{ option.label }}
            </span>
            <span class="text-xs text-muted">
              {{ option.secondary }}
            </span>
          </span>
        </TabsTrigger>
      </TabsList>
    </Tabs>

    <TeamPlayersTableLazy
      :team-id="selectedTeamId"
      :category="match"
    />
  </div>
</template>
