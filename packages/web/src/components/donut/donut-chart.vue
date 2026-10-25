<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    value: number;
    label: string;
    subLabel?: string;
    size?: number;
    strokeWidth?: number;
  }>(),
  {
    size: 160,
    strokeWidth: 16,
  },
);

const radius = computed(() => (props.size - props.strokeWidth) / 2);
const circumference = computed(() => 2 * Math.PI * radius.value);
const dashOffset = computed(() => {
  const clamped = Math.min(Math.max(props.value, 0), 1);
  return circumference.value * (1 - clamped);
});
</script>

<template>
  <div
    class="relative inline-grid place-items-center"
    :style="{ width: `${size}px`, height: `${size}px` }"
  >
    <svg
      class="size-full -rotate-90"
      :viewBox="`0 0 ${size} ${size}`"
      aria-hidden="true"
    >
      <circle
        class="fill-none stroke-border"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
      />
      <circle
        class="fill-none stroke-foreground transition-[stroke-dashoffset] duration-500"
        :cx="size / 2"
        :cy="size / 2"
        :r="radius"
        :stroke-width="strokeWidth"
        stroke-linecap="round"
        :stroke-dasharray="circumference"
        :stroke-dashoffset="dashOffset"
      />
    </svg>

    <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
      <span class="text-lg font-semibold text-foreground">
        {{ label }}
      </span>
      <span
        v-if="subLabel"
        class="text-xs text-muted"
      >
        {{ subLabel }}
      </span>
    </div>
  </div>
</template>
