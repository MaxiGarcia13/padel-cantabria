<script setup lang="ts">
import type { PlayerPageStats } from '@padel-cantabria/shared';
import {
  formatStandingValue,
  formatWinAverage,
} from '@padel-cantabria/shared';
import DonutChart from '@/components/donut/donut-chart.vue';

defineProps<{
  stats: Pick<
    PlayerPageStats,
    | 'games_played'
    | 'games_won'
    | 'games_lost'
    | 'average'
    | 'sets_for'
    | 'sets_against'
    | 'home'
    | 'away'
  >;
}>();
</script>

<template>
  <section class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <h2 class="text-sm font-medium text-muted">
      Estadísticas
    </h2>

    <div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <dl class="grid flex-1 grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Jugados
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.games_played) }}
          </dd>
        </div>
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Ganados
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.games_won) }}
          </dd>
        </div>
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Perdidos
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.games_lost) }}
          </dd>
        </div>
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Sets a favor
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.sets_for) }}
          </dd>
        </div>
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Sets en contra
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.sets_against) }}
          </dd>
        </div>
        <div class="flex flex-col gap-2">
          <dt class="text-xs text-muted">
            Local / Visitante
          </dt>
          <dd class="text-lg font-medium text-foreground">
            {{ formatStandingValue(stats.home.games_won) }}/{{ formatStandingValue(stats.home.games_played) }}
            <span class="text-sm font-normal text-muted">
              · {{ formatStandingValue(stats.away.games_won) }}/{{ formatStandingValue(stats.away.games_played) }}
            </span>
          </dd>
        </div>
      </dl>

      <div
        class="flex shrink-0 flex-col items-center gap-2 self-center"
        role="img"
        :aria-label="`Promedio de partidos ganados: ${formatWinAverage(stats.average)}`"
      >
        <DonutChart
          :value="stats.average ?? 0"
          :label="formatWinAverage(stats.average)"
          :sub-label="`${stats.games_won} / ${stats.games_played}`"
          :size="120"
          :stroke-width="12"
        />
        <p class="text-xs text-muted">
          Partidos ganados
        </p>
      </div>
    </div>
  </section>
</template>
