<script setup lang="ts">
import type { TeamCoupleStats } from '@padel-cantabria/shared';
import {
  formatStandingValue,
  formatWinAverage,
} from '@padel-cantabria/shared';
import { TableCell, TableRow } from '@/components/ui/table';

defineProps<{
  couple: TeamCoupleStats;
}>();
</script>

<template>
  <TableRow>
    <TableCell class="max-w-72 min-w-56 whitespace-normal">
      <div class="flex flex-col leading-tight">
        <span class="font-medium break-words text-foreground">
          {{ couple.player_1.name }} {{ couple.player_1.surname }}
        </span>
        <span class="font-medium break-words text-foreground">
          {{ couple.player_2.name }} {{ couple.player_2.surname }}
        </span>
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
