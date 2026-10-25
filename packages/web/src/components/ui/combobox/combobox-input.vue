<script setup lang="ts">
import type { ComboboxInputEmits, ComboboxInputProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxInput, useForwardPropsEmits } from 'reka-ui';
import { cn } from '@/utils/cn';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<
  ComboboxInputProps & {
    class?: HTMLAttributes['class'];
  }
>();

const emits = defineEmits<ComboboxInputEmits>();

const delegatedProps = reactiveOmit(props, 'class');

const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <ComboboxInput
    data-slot="combobox-input"
    :class="
      cn(
        'h-10 w-full min-w-0 rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground outline-none transition-colors placeholder:text-muted focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-40',
        props.class,
      )
    "
    v-bind="{ ...$attrs, ...forwarded }"
  />
</template>
