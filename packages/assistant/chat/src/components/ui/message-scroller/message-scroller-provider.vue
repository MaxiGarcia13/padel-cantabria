<script setup lang="ts">
import type { MessageScrollerProviderProps } from './types';
import { provideMessageScroller } from './message-scroller-context';

const props = defineProps<MessageScrollerProviderProps>();

provideMessageScroller(props);
</script>

<template>
  <slot />
</template>
