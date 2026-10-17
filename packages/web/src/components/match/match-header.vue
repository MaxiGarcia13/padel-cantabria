<script setup lang="ts">
defineProps<{
  homeTeam: string;
  awayTeam: string;
}>();
</script>

<template>
  <h1 class="text-2xl font-semibold tracking-tight text-foreground">
    {{ homeTeam }}
    <span class="text-muted"> vs </span>
    {{ awayTeam }}
  </h1>
</template>
