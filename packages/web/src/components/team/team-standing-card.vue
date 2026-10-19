<script setup lang="ts">
import type { TeamWithStandings } from '@padel-cantabria/database';
import {
  formatStandingValue,
  getPositionTrend,
} from '@padel-cantabria/shared';
import { computed } from 'vue';
import PositionTrend from '@/components/standings/position-trend.vue';

const props = defineProps<{
  standing: TeamWithStandings | null;
  standingsHref: string;
}>();

const trend = computed(() =>
  props.standing
    ? getPositionTrend(
        props.standing.position,
        props.standing.previous_position,
      )
    : 'none',
);
</script>

<template>
  <section class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <h2 class="text-sm font-medium text-muted">
      Clasificación
    </h2>

    <p
      v-if="!standing"
      class="text-sm text-muted"
    >
      No hay datos de clasificación para esta fase.
    </p>

    <dl
      v-else
      class="grid grid-cols-2 gap-4 sm:grid-cols-4"
    >
      <div class="flex flex-col gap-2">
        <dt class="text-xs text-muted">
          Posición
        </dt>
        <dd class="flex items-center gap-2 text-lg font-medium text-foreground">
          {{ formatStandingValue(standing.position) }}
          <PositionTrend :trend="trend" />
        </dd>
      </div>

      <div class="flex flex-col gap-2">
        <dt class="text-xs text-muted">
          Puntos
        </dt>
        <dd class="text-lg font-medium text-foreground">
          {{ formatStandingValue(standing.points) }}
        </dd>
      </div>

      <div class="flex flex-col gap-2">
        <dt class="text-xs text-muted">
          Enfrentamientos
        </dt>
        <dd class="text-lg font-medium text-foreground">
          {{ formatStandingValue(standing.confrontations_played) }}
        </dd>
      </div>

      <div class="flex flex-col gap-2">
        <dt class="text-xs text-muted">
          Partidos ganados
        </dt>
        <dd class="text-lg font-medium text-foreground">
          {{ formatStandingValue(standing.matches_won) }}
        </dd>
      </div>
    </dl>

    <a
      :href="standingsHref"
      class="text-sm font-medium text-primary hover:underline"
    >
      Ver tabla de posiciones
    </a>
  </section>
</template>
