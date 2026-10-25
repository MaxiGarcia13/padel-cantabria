<script setup lang="ts">
import type { TeamPlayerWithMatchStats } from '@padel-cantabria/shared';
import { formatStandingValue, getPositionTrend } from '@padel-cantabria/shared';
import { computed } from 'vue';
import PositionTrend from '@/components/standings/position-trend.vue';
import TableRow from '@/components/table/table-row.vue';

const props = defineProps<{
  player: TeamPlayerWithMatchStats;
}>();

const trend = computed(() =>
  getPositionTrend(props.player.position, props.player.previous_position),
);
</script>

<template>
  <TableRow>
    <td class="px-4 py-4 text-center font-medium text-foreground">
      {{ formatStandingValue(player.position) }}
    </td>
    <td class="px-4 py-4 text-center">
      <PositionTrend :trend="trend" />
    </td>
    <td class="px-4 py-4 font-medium text-foreground">
      {{ player.surname }}
    </td>
    <td class="px-4 py-4 text-foreground">
      {{ player.name }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(player.points) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(player.games_played) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(player.games_won) }}
    </td>
    <td class="px-4 py-4 text-center text-muted">
      {{ formatStandingValue(player.games_lost) }}
    </td>
  </TableRow>
</template>
