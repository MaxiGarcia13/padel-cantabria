<script setup lang="ts">
import type { TeamPlayer } from '@padel-cantabria/database';
import { computed } from 'vue';
import PositionTrend from '@/components/standings/position-trend.vue';
import TableRow from '@/components/table/table-row.vue';
import { formatStandingValue, getPositionTrend } from '@/domain/standings';

const props = defineProps<{
  player: TeamPlayer;
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
  </TableRow>
</template>
