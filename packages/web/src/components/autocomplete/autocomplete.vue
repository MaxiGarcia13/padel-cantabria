<script setup lang="ts">
import type { AutocompleteItem } from './types';
import { toRef } from 'vue';
import LoaderIcon from '@/components/icons/loader-icon.vue';
import AutocompleteListbox from './autocomplete-listbox.vue';
import AutocompleteOption from './autocomplete-option.vue';
import { useAutocomplete } from './use-autocomplete';

const props = withDefaults(
  defineProps<{
    id: string;
    label?: string;
    placeholder?: string;
    items: AutocompleteItem[];
    modelValue: string;
    disabled?: boolean;
    loading?: boolean;
  }>(),
  {
    disabled: false,
    loading: false,
  },
);

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [item: AutocompleteItem];
}>();

const {
  isDisabled,
  isClient,
  isOpen,
  activeIndex,
  inputRef,
  listboxId,
  floatingStyle,
  teleportTo,
  showResults,
  showFloating,
  onInput,
  selectItem,
  onKeydown,
  onFocus,
  onBlur,
  close,
} = useAutocomplete({
  id: props.id,
  items: toRef(props, 'items'),
  disabled: toRef(props, 'disabled'),
  loading: toRef(props, 'loading'),
  emitUpdate: (value) => emit('update:modelValue', value),
  emitSelect: (item) => emit('select', item),
});

defineExpose({ close });
</script>

<template>
  <div class="flex flex-col gap-2">
    <label
      v-if="label"
      class="text-sm text-muted"
      :for="id"
    >
      {{ label }}
    </label>

    <div class="relative">
      <input
        :id="id"
        ref="inputRef"
        type="text"
        role="combobox"
        :aria-expanded="isOpen"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        :aria-busy="loading || undefined"
        autocomplete="off"
        class="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-40"
        :class="{ 'pr-10': loading }"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="isDisabled"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      >

      <LoaderIcon
        v-if="loading"
        class="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-muted"
      />
      <span
        v-if="loading"
        class="sr-only"
      >Cargando…</span>

      <Teleport
        v-if="isClient"
        defer
        :to="teleportTo"
      >
        <div
          v-if="showFloating"
          class="z-50"
          :style="floatingStyle"
        >
          <AutocompleteListbox
            v-if="showResults"
            :id="listboxId"
          >
            <AutocompleteOption
              v-for="(item, index) in items"
              :key="item.value"
              :label="item.label"
              :description="item.description"
              :selected="index === activeIndex"
              @select="selectItem(item)"
            />
          </AutocompleteListbox>

          <slot
            v-else
            name="empty"
          />
        </div>
      </Teleport>
    </div>
  </div>
</template>
