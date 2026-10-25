<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import { Field, FieldLabel } from '@/components/ui/field';
import {
  NativeSelect,
  NativeSelectOption,
} from '@/components/ui/native-select';

withDefaults(
  defineProps<{
    id: string;
    label: string;
    modelValue: string;
    options: SelectOption[];
    disabled?: boolean;
    hideLabel?: boolean;
  }>(),
  {
    hideLabel: false,
  },
);

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
      v-if="!hideLabel"
      :for="id"
      class="text-muted"
    >
      {{ label }}
    </FieldLabel>

    <NativeSelect
      :id="id"
      :model-value="modelValue"
      :aria-label="hideLabel ? label : undefined"
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
