<script setup lang="ts">
import type { ComboboxViewportProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxViewport, useForwardProps } from 'reka-ui';
import { cn } from '@/utils/cn';

const props = defineProps<ComboboxViewportProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardProps(delegatedProps);
</script>

<template>
  <ComboboxViewport
    data-slot="combobox-viewport"
    v-bind="forwarded"
    :class="cn('no-scrollbar max-h-60 overflow-y-auto py-2 data-empty:p-0', props.class)"
  >
    <slot />
  </ComboboxViewport>
</template>
