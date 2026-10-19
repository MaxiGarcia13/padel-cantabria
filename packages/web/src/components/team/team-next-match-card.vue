<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';
import { buildMatchPath } from '@/server/load-category-matches';

const props = defineProps<{
  match: Match | null;
  calendarHref: string;
}>();

const matchHref = computed(() =>
  props.match ? buildMatchPath(props.match, props.match.id) : '#',
);

const metaParts = computed(() => {
  if (!props.match) {
    return [];
  }

  return [props.match.date, props.match.location, props.match.rounds].filter(
    (value): value is string => Boolean(value),
  );
});
</script>

<template>
  <section class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <h2 class="text-sm font-medium text-muted">
      Próximo partido
    </h2>

    <p
      v-if="!match"
      class="text-sm text-muted"
    >
      No hay partidos disponibles para esta fase.
    </p>

    <a
      v-else
      :href="matchHref"
      class="flex flex-col gap-2 text-inherit no-underline transition-colors hover:opacity-80 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <p class="text-sm font-medium text-foreground">
        {{ match.home_team }}
        <span class="text-muted"> vs </span>
        {{ match.away_team }}
      </p>
      <p
        v-if="metaParts.length > 0"
        class="text-sm text-muted"
      >
        {{ metaParts.join(' · ') }}
      </p>
    </a>

    <a
      :href="calendarHref"
      class="text-sm font-medium text-primary hover:underline"
    >
      Ver partidos
    </a>
  </section>
</template>
