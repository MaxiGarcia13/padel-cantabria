<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import { computed } from 'vue';
import Select from '@/components/select.vue';

const props = defineProps<{
  categories: SelectOption[];
  disabled?: boolean;
}>();

const model = defineModel<string>({ required: true });

const options = computed(() => props.categories);
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
