<script setup lang="ts">
defineProps<{
  label: string;
  description?: string;
  selected?: boolean;
}>();

const emit = defineEmits<{
  select: [];
}>();
</script>

<template>
  <li
    role="option"
    class="cursor-pointer px-4 py-2 text-sm text-foreground"
    :class="{ 'bg-border/60': selected }"
    :aria-selected="selected"
    @mousedown.prevent="emit('select')"
  >
    <span class="flex items-center gap-2">
      <span
        v-if="$slots.leading"
        class="shrink-0 text-muted [&_svg]:size-4"
      >
        <slot name="leading" />
      </span>

      <span class="flex min-w-0 flex-1 flex-col gap-2">
        <span class="truncate text-foreground">{{ label }}</span>
        <span
          v-if="description"
          class="truncate text-xs text-muted"
        >
          {{ description }}
        </span>
      </span>

      <span
        v-if="$slots.trailing"
        class="shrink-0 text-muted [&_svg]:size-4"
        @mousedown.prevent.stop
      >
        <slot name="trailing" />
      </span>
    </span>
  </li>
</template>
