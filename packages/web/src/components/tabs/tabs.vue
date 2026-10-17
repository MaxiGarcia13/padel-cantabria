<script setup lang="ts" generic="T extends string | number">
import type { TabOption } from './types';
import Tab from './tab.vue';

defineProps<{
  options: TabOption<T>[];
}>();

const selectedValue = defineModel<T>({ required: true });
</script>

<template>
  <div
    role="tablist"
    class="flex rounded-full border border-border bg-surface p-1"
  >
    <Tab
      v-for="option in options"
      :key="option.value"
      :value="option.value"
      :label="option.label"
      :secondary="option.secondary"
      :active="selectedValue === option.value"
      @select="selectedValue = $event"
    />
  </div>
</template>
