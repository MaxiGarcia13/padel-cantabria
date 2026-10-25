<script setup lang="ts">
import type { TeamWithStandings } from '@padel-cantabria/database';
import {
  formatStandingValue,
  getPositionTrend,
} from '@padel-cantabria/shared';
import PositionTrend from '@/components/standings/position-trend.vue';
import TeamWinRateDonut from './team-win-rate-donut.vue';

defineProps<{
  standing: TeamWithStandings | null;
  standingsHref: string;
}>();
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

    <div
      v-else
      class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
    >
      <dl class="grid flex-1 grid-cols-2 gap-4">
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Posición
          </dt>
          <dd class="flex items-center gap-2 text-lg font-medium text-foreground">
            {{ formatStandingValue(standing.position) }}
            <PositionTrend
              :trend="
                getPositionTrend(
                  standing.position,
                  standing.previous_position,
                )
              "
            />
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
            <span
              v-if="standing.matches_played != null"
              class="text-sm font-normal text-muted"
            >
              / {{ formatStandingValue(standing.matches_played) }}
            </span>
          </dd>
        </div>
      </dl>

      <TeamWinRateDonut
        :matches-played="standing.matches_played"
        :matches-won="standing.matches_won"
      />
    </div>

    <a
      :href="standingsHref"
      class="text-sm font-medium text-primary hover:underline"
    >
      Ver tabla de posiciones
    </a>
  </section>
</template>
