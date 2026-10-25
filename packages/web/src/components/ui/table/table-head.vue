<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <th
    data-slot="table-head"
    :class="
      cn(
        'h-auto px-4 py-4 text-left align-middle font-medium whitespace-nowrap',
        props.class,
      )
    "
  >
    <slot />
  </th>
</template>
