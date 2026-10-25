<script setup lang="ts">
import type { PositionTrend } from '@padel-cantabria/shared';

defineProps<{
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
  same: null,
  none: null,
};

const TREND_COLOR_CLASSES: Record<PositionTrend, string> = {
  up: 'text-emerald-400',
  down: 'text-danger',
  same: 'text-muted',
  none: '',
};
</script>

<template>
  <span
    v-if="TREND_SYMBOLS[trend]"
    class="inline-block w-4 text-center text-sm"
    :class="TREND_COLOR_CLASSES[trend]"
    :aria-label="TREND_LABELS[trend] ?? undefined"
    :title="TREND_LABELS[trend] ?? undefined"
  >
    {{ TREND_SYMBOLS[trend] }}
  </span>
</template>
