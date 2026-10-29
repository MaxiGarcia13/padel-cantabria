<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import type { MatchResultSummary } from '@padel-cantabria/shared';
import { formatMatchMeta } from '@padel-cantabria/shared';
import { computed } from 'vue';
import { buildMatchPath } from '@/routes';

const props = defineProps<{
  match: Match;
  result?: MatchResultSummary | null;
}>();

const href = buildMatchPath(props.match, props.match.id);

const meta = formatMatchMeta(props.match);

const isPlayed = computed(() => Boolean(props.result?.is_played));

const scoreLabel = computed(() =>
  isPlayed.value
    ? (props.result?.score_label ?? null)
    : null,
);

const homeClass = computed(() => {
  if (!isPlayed.value || props.result?.winner !== 'away') {
    return 'font-medium text-foreground';
  }

  return 'text-muted';
});

const awayClass = computed(() => {
  if (!isPlayed.value || props.result?.winner !== 'home') {
    return 'font-medium text-foreground';
  }

  return 'text-muted';
});
</script>

<template>
  <a
    :href="href"
    class="block rounded-xl border border-border bg-surface p-4 text-inherit no-underline transition-colors hover:border-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
  >
    <div class="flex items-center gap-3">
      <p
        class="min-w-0 flex-1 truncate text-sm"
        :class="homeClass"
      >
        {{ match.home_team }}
      </p>
      <p
        class="w-10 shrink-0 text-center text-sm tabular-nums"
        :class="
          scoreLabel
            ? 'font-medium text-foreground'
            : 'font-medium text-muted'
        "
      >
        {{ scoreLabel ?? 'vs' }}
      </p>
      <p
        class="min-w-0 flex-1 truncate text-right text-sm"
        :class="awayClass"
      >
        {{ match.away_team }}
      </p>
    </div>
    <div
      v-if="meta || isPlayed"
      class="mt-2 flex items-center gap-2"
    >
      <p
        v-if="meta"
        class="min-w-0 flex-1 truncate text-sm text-muted"
      >
        {{ meta }}
      </p>
      <span
        v-if="isPlayed"
        class="inline-flex shrink-0 items-center rounded-xl border border-border px-3 py-1 text-xs text-muted"
      >
        Finalizado
      </span>
    </div>
  </a>
</template>
