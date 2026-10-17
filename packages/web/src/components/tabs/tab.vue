<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue';

const props = defineProps<{
  value: T;
  label: string;
  secondary?: string;
  active: boolean;
}>();

const emit = defineEmits<{
  select: [value: T];
}>();

const buttonClass = computed(() =>
  props.active
    ? 'bg-background font-medium text-foreground'
    : 'bg-transparent font-normal text-foreground/70',
);
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    class="min-w-0 flex-1 rounded-full px-2 py-2 text-sm transition-colors sm:px-4"
    :class="buttonClass"
    @click="emit('select', value)"
  >
    <span class="flex flex-col items-center text-center leading-tight">
      <span class="line-clamp-2">
        {{ label }}
      </span>
      <span
        v-if="secondary"
        class="text-xs text-muted"
      >
        {{ secondary }}
      </span>
    </span>
  </button>
</template>
