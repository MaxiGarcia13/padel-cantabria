<script setup lang="ts">
import type { SelectOption } from '@padel-cantabria/database';
import ChevronDownIcon from '@/components/icons/chevron-down-icon.vue';
import { Field, FieldLabel } from '@/components/ui/field';

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
  <Field>
    <FieldLabel
      :for="id"
      class="text-muted"
    >
      {{ label }}
    </FieldLabel>

    <div class="relative">
      <select
        :id="id"
        class="w-full appearance-none rounded-xl border border-border bg-surface px-4 py-2 pr-10 text-foreground disabled:cursor-not-allowed disabled:opacity-40"
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

      <ChevronDownIcon
        class="pointer-events-none absolute top-1/2 right-2 size-5 -translate-y-1/2 text-muted"
      />
    </div>
  </Field>
</template>
