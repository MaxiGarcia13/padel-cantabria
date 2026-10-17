<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';
import { buildMatchPath } from '@/server/load-category-matches';

const props = defineProps<{
  match: Match;
}>();

const href = computed(() => buildMatchPath(props.match, props.match.id));

const metaParts = computed(() =>
  [props.match.date, props.match.location, props.match.schedule].filter(
    (value): value is string => Boolean(value),
  ),
);
</script>

<template>
  <a
    :href="href"
    class="block rounded-xl border border-border bg-surface px-4 py-4 text-inherit no-underline transition-colors hover:border-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
  >
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
  </a>
</template>
