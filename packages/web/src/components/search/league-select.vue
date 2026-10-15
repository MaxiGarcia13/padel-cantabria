<script setup lang="ts">
import type { League } from '@padel-cantabria/database';
import { computed, watch } from 'vue';
import Select from '@/components/select.vue';

const model = defineModel<string>({ required: true });

const props = defineProps<{
  leagues: League[];
}>();

const options = computed(() =>
  props.leagues.map((league) => ({
    value: String(league.league_id),
    label: league.name,
  })),
);

watch(
  () => props.leagues,
  (leagues) => {
    if (model.value || !leagues[0]) {
      return;
    }

    model.value = String(leagues[0].league_id);
  },
  { immediate: true },
);
</script>

<template>
  <Select
    id="league"
    v-model="model"
    label="Liga"
    :options="options"
  />
</template>
