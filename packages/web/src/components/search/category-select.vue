<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import { computed, watch } from 'vue';
import Select from '@/components/select.vue';

const model = defineModel<string>({ required: true });

const props = defineProps<{
  categories: SelectOption[];
  disabled?: boolean;
}>();

const options = computed(() => props.categories);

watch(
  () => props.categories,
  () => {
    model.value = '';
  },
);
</script>

<template>
  <Select
    id="category"
    v-model="model"
    label="Categoría"
    :options="options"
    :disabled="disabled"
  />
</template>
