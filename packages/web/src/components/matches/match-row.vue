<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';

const props = defineProps<{
  match: Match;
}>();

const metaParts = computed(() =>
  [props.match.date, props.match.location, props.match.schedule].filter(
    (value): value is string => Boolean(value),
  ),
);
</script>

<template>
  <article class="rounded-xl border border-border bg-surface px-4 py-4">
    <p class="text-sm font-medium text-foreground">
      {{ match.home_team }}
      <span class="text-muted"> vs </span>
      {{ match.away_team }}
    </p>
    <p
      v-if="metaParts.length > 0"
      class="mt-2 text-sm text-muted"
    >
      {{ metaParts.join(' · ') }}
    </p>
  </article>
</template>
