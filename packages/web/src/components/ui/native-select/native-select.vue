<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit, useVModel } from '@vueuse/core';
import ChevronDownIcon from '@/components/icons/chevron-down-icon.vue';
import { cn } from '@/utils/cn';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<{
  modelValue?: AcceptableValue | AcceptableValue[];
  class?: HTMLAttributes['class'];
  size?: 'sm' | 'default';
}>();

const emit = defineEmits<{
  'update:modelValue': [value: AcceptableValue];
}>();

const modelValue = useVModel(props, 'modelValue', emit, {
  passive: true,
  defaultValue: '',
});

const delegatedProps = reactiveOmit(props, 'class', 'size');
</script>

<template>
  <div
    :class="
      cn(
        'group/native-select relative w-full has-[select:disabled]:opacity-40',
        props.class,
      )
    "
    data-slot="native-select-wrapper"
    :data-size="props.size ?? 'default'"
  >
    <select
      v-bind="{ ...$attrs, ...delegatedProps }"
      v-model="modelValue"
      data-slot="native-select"
      class="h-10 w-full min-w-0 appearance-none rounded-xl border border-border bg-surface py-2 pr-10 pl-4 text-sm text-foreground transition-colors outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed data-[size=sm]:h-8"
      :data-size="props.size ?? 'default'"
    >
      <slot />
    </select>
    <ChevronDownIcon
      class="pointer-events-none absolute top-1/2 right-2 size-5 -translate-y-1/2 text-muted select-none"
      aria-hidden="true"
      data-slot="native-select-icon"
    />
  </div>
</template>
