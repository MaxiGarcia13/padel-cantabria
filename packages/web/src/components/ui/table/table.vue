<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="table-container"
    class="relative w-full overflow-x-auto rounded-xl border border-border"
  >
    <table
      data-slot="table"
      :class="cn('w-full min-w-4xl caption-bottom border-separate border-spacing-0 text-left text-sm', props.class)"
    >
      <slot />
    </table>
  </div>
</template>
