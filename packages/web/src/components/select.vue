<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import Field from './field.vue';

defineProps<{
  id: string;
  label: string;
  modelValue: string;
  options: SelectOption[];
  disabled?: boolean;
}>();

defineEmits<{
  'update:modelValue': [value: string];
}>();
</script>

<template>
  <Field
    :id="id"
    :label="label"
  >
    <select
      :id="id"
      class="w-full rounded-xl border border-border bg-surface px-4 py-2 text-foreground disabled:cursor-not-allowed disabled:opacity-40"
      :value="modelValue"
      :disabled="disabled || options.length === 0"
      @change="
        $emit(
          'update:modelValue',
          ($event.target as HTMLSelectElement).value,
        )
      "
    >
      <option value="" disabled>
        Seleccionar
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
  </Field>
</template>
