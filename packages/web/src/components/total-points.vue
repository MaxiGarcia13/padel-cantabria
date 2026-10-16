<script setup lang="ts">
import { computed } from 'vue';
import { formatStandingValue } from '@/domain/standings';

const props = withDefaults(
  defineProps<{
    points: number | null;
    label?: string;
  }>(),
  {
    label: 'Puntos',
  },
);

const formattedPoints = computed(() => formatStandingValue(props.points));
</script>

<template>
  <div class="flex shrink-0 flex-col items-end gap-2">
    <span class="text-xs text-muted">
      {{ label }}
    </span>
    <span class="text-2xl font-semibold tracking-tight text-foreground">
      {{ formattedPoints }}
    </span>
  </div>
</template>
