<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/utils/cn';

const props = defineProps<{
  class?: HTMLAttributes['class'];
}>();
</script>

<template>
  <div
    data-slot="skeleton"
    aria-hidden="true"
    :class="cn('animate-pulse rounded-xl bg-border/60', props.class)"
  />
</template>
