<script setup lang="ts" generic="T extends string | number">
import { computed } from 'vue';

const props = defineProps<{
  value: T;
  label: string;
  active: boolean;
}>();

const emit = defineEmits<{
  select: [value: T];
}>();

const buttonClass = computed(() =>
  props.active
    ? 'bg-background font-medium text-foreground'
    : 'bg-transparent font-normal text-muted',
);
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    class="min-w-0 flex-1 rounded-full px-4 py-2 text-sm transition-colors"
    :class="buttonClass"
    @click="emit('select', value)"
  >
    <span class="block truncate">
      {{ label }}
    </span>
  </button>
</template>
