<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import type { TeamCoupleStats } from '@padel-cantabria/shared';
import {
  formatStandingValue,
  formatWinAverage,
} from '@padel-cantabria/shared';
import { TableCell, TableRow } from '@/components/ui/table';
import { buildPlayerPath } from '@/routes';

const props = defineProps<{
  couple: TeamCoupleStats;
  teamId: number;
  category: CategoryKey;
}>();

const player1Href = buildPlayerPath(
  props.category,
  props.teamId,
  props.couple.player_1,
);
const player2Href = buildPlayerPath(
  props.category,
  props.teamId,
  props.couple.player_2,
);
const player1Name = `${props.couple.player_1.name} ${props.couple.player_1.surname}`;
const player2Name = `${props.couple.player_2.name} ${props.couple.player_2.surname}`;
</script>

<template>
  <TableRow>
    <TableCell class="max-w-72 min-w-56 whitespace-normal">
      <div class="flex flex-col leading-tight">
        <a
          :href="player1Href"
          class="font-medium wrap-break-word text-inherit no-underline hover:underline focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          :title="player1Name"
        >
          {{ player1Name }}
        </a>
        <a
          :href="player2Href"
          class="font-medium wrap-break-word text-inherit no-underline hover:underline focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
          :title="player2Name"
        >
          {{ player2Name }}
        </a>
      </div>
    </TableCell>
    <TableCell class="text-center whitespace-nowrap text-muted">
      {{ formatStandingValue(couple.games_played) }}
    </TableCell>
    <TableCell class="text-center whitespace-nowrap text-muted">
      {{ formatStandingValue(couple.games_won) }}
    </TableCell>
    <TableCell class="text-center whitespace-nowrap text-muted">
      {{ formatStandingValue(couple.games_lost) }}
    </TableCell>
    <TableCell class="text-center whitespace-nowrap text-muted">
      {{ formatWinAverage(couple.average) }}
    </TableCell>
  </TableRow>
</template>
