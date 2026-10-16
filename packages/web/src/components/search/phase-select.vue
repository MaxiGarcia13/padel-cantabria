<script setup lang="ts">
import type { Phase } from '@padel-cantabria/database';
import { computed } from 'vue';
import Select from '@/components/select.vue';

const props = defineProps<{
  phases: Phase[];
  disabled?: boolean;
}>();

const model = defineModel<string>({ required: true });

const options = computed(() => props.phases);
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
