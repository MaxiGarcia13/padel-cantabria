<script setup lang="ts">
import type { TeamPlayerWithMatchStats } from '@padel-cantabria/shared';
import { formatStandingValue, getPositionTrend } from '@padel-cantabria/shared';
import PositionTrend from '@/components/standings/position-trend.vue';
import { TableCell, TableRow } from '@/components/ui/table';

const props = defineProps<{
  player: TeamPlayerWithMatchStats;
}>();

const trend = getPositionTrend(
  props.player.position,
  props.player.previous_position,
);
</script>

<template>
  <TableRow>
    <TableCell class="w-12 text-center font-medium text-foreground">
      {{ formatStandingValue(player.position) }}
    </TableCell>
    <TableCell class="w-8 text-center">
      <PositionTrend :trend="trend" />
    </TableCell>
    <TableCell class="font-medium text-foreground">
      {{ player.surname }}
    </TableCell>
    <TableCell class="text-foreground">
      {{ player.name }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(player.points) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(player.games_played) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(player.games_won) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(player.games_lost) }}
    </TableCell>
  </TableRow>
</template>
