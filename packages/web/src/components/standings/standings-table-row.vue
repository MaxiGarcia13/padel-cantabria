<script setup lang="ts">
import type { TeamWithStandings } from '@padel-cantabria/database';
import { formatStandingValue, getPositionTrend } from '@padel-cantabria/shared';
import { TableCell, TableRow } from '@/components/ui/table';
import { buildTeamPath } from '@/routes';
import PositionTrend from './position-trend.vue';

const props = defineProps<{
  team: TeamWithStandings;
}>();

const trend = getPositionTrend(
  props.team.position,
  props.team.previous_position,
);

const href = buildTeamPath(props.team.id);
</script>

<template>
  <TableRow>
    <TableCell class="w-12 text-center font-medium text-foreground">
      {{ formatStandingValue(team.position) }}
    </TableCell>
    <TableCell class="w-8 text-center">
      <PositionTrend :trend="trend" />
    </TableCell>
    <TableCell class="font-medium text-foreground">
      <a
        :href="href"
        class="text-inherit no-underline hover:underline focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
      >
        {{ team.name }}
      </a>
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.confrontations_played) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.points) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.matches_played) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.matches_won) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.sets_for) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.sets_against) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.sets_average) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.games_for) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.games_against) }}
    </TableCell>
    <TableCell class="text-center text-muted">
      {{ formatStandingValue(team.games_average) }}
    </TableCell>
  </TableRow>
</template>
