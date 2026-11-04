<script setup lang="ts">
defineProps<{
  status: string;
  statusTone: 'info' | 'error';
}>();
</script>

<template>
  <p
    class="mt-2 text-sm leading-snug"
    :class="statusTone === 'error' ? 'text-danger' : 'text-muted-foreground'"
    aria-live="polite"
  >
    {{ status }}
  </p>
</template>
