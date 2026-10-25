<script setup lang="ts">
import type { MatchGame } from '@padel-cantabria/database';
import MatchGameRow from './match-game-row.vue';

const props = defineProps<{
  games: MatchGame[];
}>();

const sortedGames = [...props.games].sort(
  (a, b) => a.game_number - b.game_number,
);
</script>

<template>
  <section
    v-if="sortedGames.length > 0"
    class="flex flex-col gap-4"
  >
    <h2 class="text-lg font-semibold tracking-tight text-foreground">
      Resultado
    </h2>
    <ul class="flex flex-col gap-2">
      <MatchGameRow
        v-for="game in sortedGames"
        :key="game.game_number"
        :game="game"
      />
    </ul>
  </section>
</template>
