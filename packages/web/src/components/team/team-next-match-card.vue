<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';

const props = defineProps<{
  match: Match | null;
  calendarHref: string;
}>();

const metaParts = computed(() => {
  if (!props.match) {
    return [];
  }

  return [props.match.date, props.match.location, props.match.schedule].filter(
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

    <div
      v-else
      class="flex flex-col gap-2"
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
    </div>

    <a
      :href="calendarHref"
      class="text-sm font-medium text-primary hover:underline"
    >
      Ver partidos
    </a>
  </section>
</template>
