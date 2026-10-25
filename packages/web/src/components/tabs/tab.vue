<script setup lang="ts" generic="T extends string | number">
defineProps<{
  value: T;
  label: string;
  secondary?: string;
  active: boolean;
}>();

const emit = defineEmits<{
  select: [value: T];
}>();
</script>

<template>
  <button
    type="button"
    role="tab"
    :aria-selected="active"
    class="min-w-0 flex-1 rounded-xl px-4 py-2 text-sm transition-colors"
    :class="
      active
        ? 'bg-background font-medium text-foreground'
        : 'bg-transparent font-normal text-foreground/70'
    "
    @click="emit('select', value)"
  >
    <span class="flex flex-col items-center text-center leading-tight">
      <span class="line-clamp-2">
        {{ label }}
      </span>
      <span
        v-if="secondary"
        class="text-xs text-muted"
      >
        {{ secondary }}
      </span>
    </span>
  </button>
</template>
