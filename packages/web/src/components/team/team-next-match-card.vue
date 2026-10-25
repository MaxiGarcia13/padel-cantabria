<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { formatMatchMeta } from '@padel-cantabria/shared';
import { computed } from 'vue';
import { buildMatchPath } from '@/routes';

const props = defineProps<{
  match: Match | null;
  calendarHref: string;
}>();

const meta = computed(() =>
  props.match ? formatMatchMeta(props.match) : '',
);
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
      :href="buildMatchPath(match, match.id)"
      class="flex flex-col gap-2 text-inherit no-underline transition-colors hover:opacity-80 focus-visible:rounded-xl focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
    >
      <p class="text-sm font-medium text-foreground">
        {{ match.home_team }}
        <span class="text-muted"> vs </span>
        {{ match.away_team }}
      </p>
      <p
        v-if="meta"
        class="text-sm text-muted"
      >
        {{ meta }}
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
