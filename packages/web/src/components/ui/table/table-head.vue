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
        'h-auto px-2 py-2 text-left align-middle text-xs font-medium whitespace-nowrap',
        props.class,
      )
    "
  >
    <slot />
  </th>
</template>
