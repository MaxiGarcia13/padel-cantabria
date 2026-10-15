<script setup lang="ts">
import type { Phase } from '@padel-cantabria/database';
import { computed, watch } from 'vue';
import Select from '@/components/select.vue';

const model = defineModel<string>({ required: true });

const props = defineProps<{
  phases: Phase[];
  disabled?: boolean;
}>();

const options = computed(() => props.phases);

watch(
  () => props.phases,
  () => {
    model.value = '';
  },
);
</script>

<template>
  <Select
    id="phase"
    v-model="model"
    label="Fase"
    :options="options"
    :disabled="disabled"
  />
</template>
