<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'default' | 'sm' | 'icon' | 'icon-sm';
    type?: 'button' | 'submit' | 'reset';
    disabled?: boolean;
    class?: string;
  }>(),
  {
    variant: 'primary',
    size: 'default',
    type: 'button',
    disabled: false,
  },
);

const variantClassName: Record<NonNullable<typeof props.variant>, string> = {
  primary:
    'bg-primary text-primary-foreground hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40',
  ghost:
    'bg-transparent text-muted hover:bg-surface hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40',
};

const sizeClassName: Record<NonNullable<typeof props.size>, string> = {
  'default': 'px-6 py-2 font-medium',
  'sm': 'px-4 py-2 text-sm',
  'icon': 'size-10',
  'icon-sm': 'size-8',
};

const className = computed(() =>
  [
    'inline-flex shrink-0 cursor-pointer items-center justify-center rounded-xl transition-colors',
    variantClassName[props.variant],
    sizeClassName[props.size],
    props.class,
  ]
    .filter(Boolean)
    .join(' '),
);
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="className"
  >
    <slot />
  </button>
</template>
