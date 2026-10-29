<script setup lang="ts">
import type { MatchResultSummary } from '@padel-cantabria/shared';

const props = defineProps<{
  homeTeam: string;
  awayTeam: string;
  result?: MatchResultSummary | null;
}>();

const isPlayed = Boolean(props.result?.is_played);
const scoreLabel = isPlayed
  ? (props.result?.score_label ?? null)
  : null;

const homeClass
  = isPlayed && props.result?.winner === 'away'
    ? 'text-muted'
    : 'text-foreground';

const awayClass
  = isPlayed && props.result?.winner === 'home'
    ? 'text-muted'
    : 'text-foreground';
</script>

<template>
  <div class="flex flex-col gap-2">
    <h1 class="text-2xl font-semibold tracking-tight">
      <span :class="homeClass">{{ homeTeam }}</span>
      <span
        class="mx-2 tabular-nums"
        :class="scoreLabel ? 'text-foreground' : 'text-muted'"
      >
        {{ scoreLabel ?? 'vs' }}
      </span>
      <span :class="awayClass">{{ awayTeam }}</span>
    </h1>
    <span
      v-if="isPlayed"
      class="inline-flex w-fit items-center rounded-xl border border-border px-3 py-1 text-xs text-muted"
    >
      Finalizado
    </span>
  </div>
</template>
