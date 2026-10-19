<script setup lang="ts">
import type { MessageScrollerProviderProps } from './use-message-scroller';
import { provideMessageScroller } from './use-message-scroller';

const props = defineProps<MessageScrollerProviderProps>();

provideMessageScroller(props);
</script>

<template>
  <slot />
</template>
