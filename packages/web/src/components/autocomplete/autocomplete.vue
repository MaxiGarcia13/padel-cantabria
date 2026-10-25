<script setup lang="ts">
import type { AcceptableValue } from 'reka-ui';
import type { AutocompleteItem } from './types';
import { computed, ref, useSlots } from 'vue';
import LoaderIcon from '@/components/icons/loader-icon.vue';
import {
  Combobox,
  ComboboxAnchor,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxViewport,
} from '@/components/ui/combobox';

const props = withDefaults(
  defineProps<{
    id: string;
    placeholder?: string;
    items: AutocompleteItem[];
    disabled?: boolean;
    loading?: boolean;
    defaultOpen?: boolean;
  }>(),
  {
    disabled: false,
    loading: false,
    defaultOpen: false,
  },
);

const emit = defineEmits<{
  select: [item: AutocompleteItem];
}>();

const query = defineModel<string>({ default: '' });
const isOpen = ref(props.defaultOpen);
const selectedItem = ref<AutocompleteItem>();
const slots = useSlots();

const isQueryEmpty = computed(() => !query.value.trim());

const canShowPopup = computed(() => {
  if (isQueryEmpty.value) {
    return Boolean(slots.empty);
  }

  return props.items.length > 0;
});

function isAutocompleteItem(value: AcceptableValue): value is AutocompleteItem {
  return (
    typeof value === 'object'
    && value !== null
    && 'value' in value
    && 'label' in value
  );
}

function onModelUpdate(value: AcceptableValue): void {
  if (!isAutocompleteItem(value)) {
    return;
  }

  selectedItem.value = value;
  query.value = value.label;
  emit('select', value);
  isOpen.value = false;
}

function close(): void {
  isOpen.value = false;
}

defineExpose({ close });
</script>

<template>
  <Combobox
    :model-value="selectedItem"
    :open="isOpen"
    by="value"
    :ignore-filter="true"
    :open-on-focus="true"
    :disabled="disabled || loading"
    @update:model-value="onModelUpdate"
    @update:open="isOpen = $event"
  >
    <ComboboxAnchor class="relative w-full">
      <ComboboxInput
        :id="id"
        v-model="query"
        :placeholder="placeholder"
        autocomplete="off"
        :autofocus="defaultOpen"
        :class="{ 'pr-10': loading }"
      />

      <LoaderIcon
        v-if="loading"
        class="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 animate-spin text-muted"
      />
      <span
        v-if="loading"
        class="sr-only"
      >Cargando…</span>
    </ComboboxAnchor>

    <ComboboxList v-if="canShowPopup">
      <ComboboxViewport>
        <slot
          v-if="isQueryEmpty"
          name="empty"
        />

        <template v-else>
          <ComboboxItem
            v-for="item in items"
            :key="item.value"
            :value="item"
          >
            <span class="flex min-w-0 flex-1 flex-col gap-2">
              <span class="truncate text-foreground">
                {{ item.label }}
              </span>
              <span
                v-if="item.description"
                class="truncate text-xs text-muted"
              >
                {{ item.description }}
              </span>
            </span>
          </ComboboxItem>
        </template>
      </ComboboxViewport>
    </ComboboxList>
  </Combobox>
</template>
