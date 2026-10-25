<script setup lang="ts">
import type { CategoryKey, TeamPlayer } from '@padel-cantabria/database';
import type { TeamDisplayLabels } from '@padel-cantabria/shared';
import {
  formatStandingValue,
  getPositionTrend,

} from '@padel-cantabria/shared';
import PositionTrend from '@/components/standings/position-trend.vue';
import { buildTeamPath } from '@/routes';

const props = defineProps<{
  player: TeamPlayer;
  teamName: string;
  teamId: number;
  category: CategoryKey;
  displayLabels: TeamDisplayLabels;
}>();

const teamHref = buildTeamPath(props.category, props.teamId);
const displayName = `${props.player.name} ${props.player.surname}`;
const trend = getPositionTrend(
  props.player.position,
  props.player.previous_position,
);
</script>

<template>
  <header class="flex flex-col gap-4">
    <div class="flex flex-col gap-2">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ displayName }}
      </h1>
      <a
        :href="teamHref"
        class="w-fit text-sm font-medium text-primary hover:underline"
      >
        {{ teamName }}
      </a>
    </div>

    <dl class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <div class="flex items-center gap-2">
        <dt class="text-muted">
          Posición
        </dt>
        <dd class="flex items-center gap-2 font-medium text-foreground">
          {{ formatStandingValue(player.position) }}
          <PositionTrend :trend="trend" />
        </dd>
      </div>
      <div class="flex gap-2">
        <dt class="text-muted">
          Puntos
        </dt>
        <dd class="font-medium text-foreground">
          {{ formatStandingValue(player.points) }}
        </dd>
      </div>
      <div class="flex gap-2">
        <dt class="text-muted">
          Categoría
        </dt>
        <dd class="font-medium text-foreground">
          {{ displayLabels.categoryLabel }}
        </dd>
      </div>
      <div class="flex gap-2">
        <dt class="text-muted">
          Género
        </dt>
        <dd class="font-medium text-foreground">
          {{ displayLabels.genderLabel }}
        </dd>
      </div>
    </dl>
  </header>
</template>
