<script setup lang="ts">
import type { MatchGame } from '@padel-cantabria/database';

const props = defineProps<{
  game: MatchGame;
}>();

function compareSets(
  home: number | null,
  away: number | null,
): 'home' | 'away' | 'draw' | null {
  if (home === null || away === null) {
    return null;
  }

  if (home > away) {
    return 'home';
  }

  if (away > home) {
    return 'away';
  }

  return 'draw';
}

const outcome = compareSets(props.game.home_sets, props.game.away_sets);

const homeClass
  = outcome === 'away'
    ? 'text-muted'
    : 'font-medium text-foreground';
const awayClass
  = outcome === 'home'
    ? 'text-muted'
    : 'font-medium text-foreground';

const setsLabel
  = props.game.home_sets !== null && props.game.away_sets !== null
    ? `${props.game.home_sets}-${props.game.away_sets}`
    : '—';

const homePair = [props.game.home_player_1, props.game.home_player_2]
  .filter(Boolean)
  .join(' / ');
const awayPair = [props.game.away_player_1, props.game.away_player_2]
  .filter(Boolean)
  .join(' / ');
</script>

<template>
  <li
    class="flex flex-col gap-2 rounded-xl border border-border bg-surface p-4 sm:flex-row sm:items-center sm:justify-between"
  >
    <div class="flex min-w-0 flex-col gap-2">
      <span class="text-sm text-muted">
        Pareja {{ game.game_number }}
      </span>
      <div class="flex flex-col gap-2 text-sm sm:flex-row sm:items-center sm:gap-4">
        <span :class="homeClass">
          {{ homePair || '—' }}
        </span>
        <span class="hidden text-muted sm:inline">vs</span>
        <span :class="awayClass">
          {{ awayPair || '—' }}
        </span>
      </div>
      <p
        v-if="game.partials"
        class="text-sm text-muted"
      >
        {{ game.partials }}
      </p>
    </div>
    <span class="shrink-0 text-sm font-medium text-foreground tabular-nums">
      {{ setsLabel }}
    </span>
  </li>
</template>
