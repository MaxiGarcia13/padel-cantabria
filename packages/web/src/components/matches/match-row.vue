<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import type { MatchResultSummary } from '@padel-cantabria/shared';
import { formatMatchMeta } from '@padel-cantabria/shared';
import { computed } from 'vue';
import { buildMatchPath } from '@/server/load-category-matches';

const props = defineProps<{
  match: Match;
  result?: MatchResultSummary | null;
}>();

const href = computed(() => buildMatchPath(props.match, props.match.id));

const meta = computed(() => formatMatchMeta(props.match));

const homeClass = computed(() =>
  props.result?.winner === 'away' ? 'text-muted' : 'text-foreground',
);

const awayClass = computed(() =>
  props.result?.winner === 'home' ? 'text-muted' : 'text-foreground',
);
</script>

<template>
  <a
    :href="href"
    class="block rounded-xl border border-border bg-surface px-4 py-4 text-inherit no-underline transition-colors hover:border-muted focus-visible:ring-2 focus-visible:ring-primary focus-visible:outline-none"
  >
    <p class="text-sm font-medium">
      <span :class="homeClass">{{ match.home_team }}</span>
      <span class="text-muted"> vs </span>
      <span :class="awayClass">{{ match.away_team }}</span>
      <span
        v-if="result?.score_label"
        class="text-muted"
      >
        · {{ result.score_label }}
      </span>
    </p>
    <p
      v-if="meta"
      class="mt-2 text-sm text-muted"
    >
      {{ meta }}
    </p>
  </a>
</template>
