<script setup lang="ts">
import type { ComboboxEmptyProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import { ComboboxEmpty } from 'reka-ui';
import { cn } from '@/utils/cn';

const props = defineProps<ComboboxEmptyProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
</script>

<template>
  <ComboboxEmpty
    data-slot="combobox-empty"
    v-bind="delegatedProps"
    :class="cn('hidden w-full justify-center px-4 py-2 text-center text-sm text-muted group-data-empty/combobox-content:flex', props.class)"
  >
    <slot />
  </ComboboxEmpty>
</template>
