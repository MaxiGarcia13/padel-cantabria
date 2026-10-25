<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <td
    data-slot="table-cell"
    :class="cn('px-2 py-4 align-middle whitespace-nowrap', props.class)"
  >
    <slot />
  </td>
</template>
