<script setup lang="ts">
import type { Gender } from '@padel-cantabria/database';
import { computed, watch } from 'vue';
import { getDefaultGenderValue } from './get-default-gender-value';
import Select from '@/components/select.vue';

const model = defineModel<string>({ required: true });

const props = defineProps<{
  genders: Gender[];
  disabled?: boolean;
}>();

const options = computed(() => props.genders);

watch(
  () => props.genders,
  (genders) => {
    model.value = getDefaultGenderValue(genders);
  },
  { immediate: true },
);
</script>

<template>
  <Select
    id="gender"
    v-model="model"
    label="Género"
    :options="options"
    :disabled="disabled"
  />
</template>
