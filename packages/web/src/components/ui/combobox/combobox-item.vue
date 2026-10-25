<script setup lang="ts">
import type { ComboboxItemEmits, ComboboxItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxItem, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/utils/cn';

const props = defineProps<
  ComboboxItemProps & { class?: HTMLAttributes['class'] }
>();
const emits = defineEmits<ComboboxItemEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxItem
    data-slot="combobox-item"
    v-bind="forwarded"
    :class="
      cn(
        'relative flex w-full cursor-pointer items-center gap-2 px-4 py-2 text-sm text-foreground outline-none select-none data-highlighted:bg-border/60 data-disabled:pointer-events-none data-disabled:opacity-40',
        props.class,
      )
    "
  >
    <slot />
  </ComboboxItem>
</template>
