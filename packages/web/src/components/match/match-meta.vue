<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';

const props = defineProps<{
  match: Match;
}>();

const metaParts = computed(() =>
  [props.match.date, props.match.location, props.match.rounds].filter(
    (value): value is string => Boolean(value),
  ),
);
</script>

<template>
  <p
    v-if="metaParts.length > 0"
    class="text-sm text-muted"
  >
    {{ metaParts.join(' · ') }}
  </p>
</template>
