<script setup lang="ts">
import type { Gender } from '@padel-cantabria/database';
import { computed } from 'vue';
import Select from '@/components/select.vue';

const props = defineProps<{
  genders: Gender[];
  disabled?: boolean;
}>();

const model = defineModel<string>({ required: true });

const options = computed(() => props.genders);
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
