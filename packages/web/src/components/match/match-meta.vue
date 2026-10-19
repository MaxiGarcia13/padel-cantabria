<script setup lang="ts">
import type { Match } from '@padel-cantabria/database';
import { formatMatchMeta } from '@padel-cantabria/shared';
import { computed } from 'vue';

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
