<script setup lang="ts">
import type { PositionTrend } from '@padel-cantabria/shared';
import { computed } from 'vue';

const props = defineProps<{
  trend: PositionTrend;
}>();

const TREND_LABELS: Record<PositionTrend, string | null> = {
  up: 'Subió',
  down: 'Bajó',
  same: 'Sin cambios',
  none: null,
};

const TREND_SYMBOLS: Record<PositionTrend, string | null> = {
  up: '↑',
  down: '↓',
  same: '=',
  none: null,
};

const TREND_COLOR_CLASSES: Record<PositionTrend, string> = {
  up: 'text-emerald-400',
  down: 'text-danger',
  same: 'text-muted',
  none: '',
};

const label = computed(() => TREND_LABELS[props.trend]);
const symbol = computed(() => TREND_SYMBOLS[props.trend]);
const colorClass = computed(() => TREND_COLOR_CLASSES[props.trend]);
</script>

<template>
  <span
    v-if="symbol"
    class="inline-block w-4 text-center text-sm"
    :class="colorClass"
    :aria-label="label ?? undefined"
    :title="label ?? undefined"
  >
    {{ symbol }}
  </span>
</template>
