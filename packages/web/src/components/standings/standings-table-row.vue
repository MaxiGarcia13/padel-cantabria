<script setup lang="ts">
import type { TeamWithStandings } from '@padel-cantabria/database';
import { computed } from 'vue';
import TableRow from '@/components/table/table-row.vue';
import { formatStandingValue, getPositionTrend } from '@/domain/standings';
import PositionTrend from './position-trend.vue';

const props = defineProps<{
  team: TeamWithStandings;
}>();

const trend = computed(() =>
  getPositionTrend(props.team.position, props.team.previous_position),
);
</script>

<template>
  <TableRow>
    <td class="px-4 py-4 text-center font-medium text-foreground">
      {{ formatStandingValue(team.position) }}
    </td>
    <td class="px-4 py-4 text-center">
      <PositionTrend :trend="trend" />
    </td>
    <td class="px-4 py-4 font-medium text-foreground">
      {{ team.name }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.confrontations_played) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.points) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.matches_played) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.matches_won) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.sets_for) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.sets_against) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.sets_average) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.games_for) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.games_against) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(team.games_average) }}
    </td>
  </TableRow>
</template>
