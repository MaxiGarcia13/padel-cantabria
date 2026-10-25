<script setup lang="ts">
import { formatStandingValue } from '@padel-cantabria/shared';

withDefaults(
  defineProps<{
    points: number | null;
    label?: string;
  }>(),
  {
    label: 'Puntos',
  },
);
</script>

<template>
  <div class="flex shrink-0 flex-col items-end gap-2">
    <span class="text-xs text-muted">
      {{ label }}
    </span>
    <span class="text-2xl font-semibold tracking-tight text-foreground">
      {{ formatStandingValue(points) }}
    </span>
  </div>
</template>
