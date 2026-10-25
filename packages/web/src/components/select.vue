<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

defineProps<{
  id: string;
  label: string;
  modelValue: string;
  options: SelectOption[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
}>();

function onUpdate(value: unknown): void {
  emit('update:modelValue', String(value ?? ''));
}
</script>

<template>
  <Field>
    <FieldLabel
      :for="id"
      class="text-muted"
    >
      {{ label }}
    </FieldLabel>

    <NativeSelect
      :id="id"
      :model-value="modelValue"
      :disabled="disabled || options.length === 0"
      @update:model-value="onUpdate"
    >
      <NativeSelectOption
        value=""
        disabled
      >
        Seleccionar
      </NativeSelectOption>
      <NativeSelectOption
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </NativeSelectOption>
    </NativeSelect>
  </Field>
</template>
