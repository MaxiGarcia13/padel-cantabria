<script setup lang="ts">
defineProps<{
  summary: string;
  expanded: boolean;
}>();

defineEmits<{
  toggle: [];
}>();
</script>

<template>
  <button
    type="button"
    class="flex w-full items-center justify-between gap-4 rounded-xl border border-border px-4 py-2 text-left"
    :aria-expanded="expanded"
    @click="$emit('toggle')"
  >
    <span class="min-w-0 truncate text-sm text-foreground">
      {{ summary }}
    </span>

    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      stroke-width="2"
      stroke-linecap="round"
      stroke-linejoin="round"
      class="size-6 shrink-0 text-muted transition-transform"
      :class="{ 'rotate-180': !expanded }"
      aria-hidden="true"
    >
      <path
        stroke="none"
        d="M0 0h24v24H0z"
        fill="none"
      />
      <path d="M6 15l6 -6l6 6" />
    </svg>
  </button>
</template>
