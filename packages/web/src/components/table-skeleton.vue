<script setup lang="ts">
import { computed } from 'vue';
import Skeleton from './skeleton.vue';

const props = withDefaults(
  defineProps<{
    rows?: number;
    columns?: number;
  }>(),
  {
    rows: 5,
    columns: 4,
  },
);

const rowIndexes = computed(() =>
  Array.from({ length: props.rows }, (_, index) => index),
);
const columnIndexes = computed(() =>
  Array.from({ length: props.columns }, (_, index) => index),
);
const gridStyle = computed(() => ({
  gridTemplateColumns: `repeat(${props.columns}, minmax(0, 1fr))`,
}));
</script>

<template>
  <div
    class="flex flex-col gap-4"
    role="status"
    aria-label="Cargando"
  >
    <div
      class="grid gap-4 border-b border-border pb-4"
      :style="gridStyle"
    >
      <Skeleton
        v-for="column in columnIndexes"
        :key="`header-${column}`"
        class="h-4 w-full"
      />
    </div>

    <div
      v-for="row in rowIndexes"
      :key="row"
      class="grid gap-4"
      :style="gridStyle"
    >
      <Skeleton
        v-for="column in columnIndexes"
        :key="`${row}-${column}`"
        class="h-4 w-full"
      />
    </div>
  </div>
</template>
