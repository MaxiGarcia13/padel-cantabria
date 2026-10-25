<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import type { TeamPlayerWithMatchStats } from '@padel-cantabria/shared';
import { formatStandingValue, getPositionTrend } from '@padel-cantabria/shared';
import PositionTrend from '@/components/standings/position-trend.vue';
import { TableCell, TableRow } from '@/components/ui/table';
import { buildPlayerPath } from '@/routes';

const props = defineProps<{
  player: TeamPlayerWithMatchStats;
  category: CategoryKey;
}>();

const trend = getPositionTrend(
  props.player.position,
  props.player.previous_position,
);

const href = buildPlayerPath(props.category, props.player.team_id, props.player);
const displayName = `${props.player.name} ${props.player.surname}`;
</script>

<template>
  <TableRow>
    <TableCell class="sticky left-0 z-10 w-12 bg-background text-center font-medium text-foreground">
      {{ formatStandingValue(player.position) }}
    </TableCell>
    <TableCell class="w-8 text-center">
      <PositionTrend :trend="trend" />
    </TableCell>
    <TableCell class="max-w-56 min-w-45 whitespace-normal">
      <a
        :href="href"
        class="font-medium wrap-break-word text-inherit no-underline hover:underline focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
        :title="displayName"
      >
        {{ displayName }}
      </a>
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
