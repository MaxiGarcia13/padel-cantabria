<script setup lang="ts">
import { formatWinAverage } from '@padel-cantabria/shared';
import { computed } from 'vue';
import DonutChart from '@/components/donut/donut-chart.vue';

const props = defineProps<{
  matchesPlayed: number | null;
  matchesWon: number | null;
}>();

const average = computed(() => {
  if (props.matchesPlayed == null || props.matchesPlayed <= 0 || props.matchesWon == null) {
    return null;
  }

  return props.matchesWon / props.matchesPlayed;
});

const subLabel = computed(() => {
  if (props.matchesPlayed == null || props.matchesWon == null) {
    return undefined;
  }

  return `${props.matchesWon} / ${props.matchesPlayed}`;
});

const ariaLabel = computed(
  () =>
    `Promedio de partidos ganados: ${formatWinAverage(average.value)}`,
);
</script>

<template>
  <div
    class="flex flex-col items-center gap-2"
    role="img"
    :aria-label="ariaLabel"
  >
    <DonutChart
      :value="average ?? 0"
      :label="formatWinAverage(average)"
      :sub-label="subLabel"
    />
    <p class="text-xs text-muted">
      Partidos ganados
    </p>
  </div>
</template>
