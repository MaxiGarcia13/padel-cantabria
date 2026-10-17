<script setup lang="ts">
import type { AutocompleteItem } from './types';
import { computed, onMounted, ref, useSlots, watch } from 'vue';
import LoaderIcon from '@/components/icons/loader-icon.vue';
import { useFloatingAnchor } from '@/composables/use-floating-anchor';
import AutocompleteListbox from './autocomplete-listbox.vue';
import AutocompleteOption from './autocomplete-option.vue';

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

const isDisabled = computed(() => props.disabled || props.loading);

const slots = useSlots();
const isClient = ref(false);
const isOpen = ref(false);
const activeIndex = ref(-1);
const inputRef = ref<HTMLInputElement | null>(null);
const listboxId = `${props.id}-listbox`;

const { style: floatingStyle, teleportTo, updatePosition } = useFloatingAnchor(
  inputRef,
  isOpen,
);

onMounted(() => {
  isClient.value = true;
});

const showResults = computed(() => isOpen.value && props.items.length > 0);
const showEmpty = computed(
  () => isOpen.value && props.items.length === 0 && Boolean(slots.empty),
);
const showFloating = computed(() => showResults.value || showEmpty.value);

watch(showFloating, (visible) => {
  if (visible) {
    updatePosition();
  }
});

function onInput(event: Event): void {
  const value = (event.target as HTMLInputElement).value;

  emit('update:modelValue', value);
  isOpen.value = true;
  activeIndex.value = -1;
}

function selectItem(item: AutocompleteItem): void {
  emit('update:modelValue', item.label);
  emit('select', item);
  isOpen.value = false;
  activeIndex.value = -1;
}

function onKeydown(event: KeyboardEvent): void {
  if (!isOpen.value && (event.key === 'ArrowDown' || event.key === 'ArrowUp')) {
    isOpen.value = true;
    return;
  }

  if (event.key === 'ArrowDown') {
    event.preventDefault();
    activeIndex.value = Math.min(
      activeIndex.value + 1,
      props.items.length - 1,
    );
    return;
  }

  if (event.key === 'ArrowUp') {
    event.preventDefault();
    activeIndex.value = Math.max(activeIndex.value - 1, 0);
    return;
  }

  if (event.key === 'Enter' && activeIndex.value >= 0) {
    event.preventDefault();
    const item = props.items[activeIndex.value];

    if (item) {
      selectItem(item);
    }
    return;
  }

  if (event.key === 'Escape') {
    isOpen.value = false;
    activeIndex.value = -1;
  }
}

function onFocus(): void {
  isOpen.value = true;
}

function onBlur(): void {
  window.setTimeout(() => {
    isOpen.value = false;
    activeIndex.value = -1;
  }, 150);
}

function close(): void {
  isOpen.value = false;
  activeIndex.value = -1;
}

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
