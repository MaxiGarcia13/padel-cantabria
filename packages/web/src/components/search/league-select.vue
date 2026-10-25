<script setup lang="ts">
import type { League } from '@padel-cantabria/database';
import { computed } from 'vue';
import Select from '@/components/select.vue';

const props = withDefaults(
  defineProps<{
    leagues: League[];
    disabled?: boolean;
    hideLabel?: boolean;
  }>(),
  {
    hideLabel: false,
  },
);

const model = defineModel<string>({ required: true });

const options = computed(() =>
  props.leagues.map((league) => ({
    value: String(league.league_id),
    label: league.name,
  })),
);
</script>

<template>
  <Select
    id="league"
    v-model="model"
    label="Liga"
    :options="options"
    :disabled="disabled"
    :hide-label="hideLabel"
  />
</template>
