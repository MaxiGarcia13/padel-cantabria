<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { computed } from 'vue';
import { formatMatchMeta } from '@/domain/matches';

const props = defineProps<{
  match: Match;
}>();

const meta = computed(() => formatMatchMeta(props.match));
</script>

<template>
  <p
    v-if="meta"
    class="text-sm text-muted"
  >
    {{ meta }}
  </p>
</template>
