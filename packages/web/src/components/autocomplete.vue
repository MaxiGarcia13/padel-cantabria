<script setup lang="ts">
import { ref } from 'vue';

export interface AutocompleteItem {
  value: string;
  label: string;
  description?: string;
}

const props = defineProps<{
  id: string;
  label?: string;
  placeholder?: string;
  items: AutocompleteItem[];
  modelValue: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string];
  'select': [item: AutocompleteItem];
}>();

const isOpen = ref(false);
const activeIndex = ref(-1);
const listboxId = `${props.id}-listbox`;

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
        type="text"
        role="combobox"
        :aria-expanded="isOpen"
        aria-autocomplete="list"
        :aria-controls="listboxId"
        autocomplete="off"
        class="w-full rounded-xl border border-border bg-surface px-4 py-2 text-sm text-foreground placeholder:text-muted disabled:cursor-not-allowed disabled:opacity-40"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        @input="onInput"
        @keydown="onKeydown"
        @focus="onFocus"
        @blur="onBlur"
      >

      <ul
        v-show="isOpen && items.length > 0"
        :id="listboxId"
        role="listbox"
        class="absolute z-10 mt-2 max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface py-2"
      >
        <li
          v-for="(item, index) in items"
          :key="item.value"
          role="option"
          class="cursor-pointer px-4 py-2 text-sm text-foreground"
          :class="{ 'bg-border/60': index === activeIndex }"
          :aria-selected="index === activeIndex"
          @mousedown.prevent="selectItem(item)"
        >
          <span class="flex flex-col gap-2">
            <span class="truncate text-foreground">{{ item.label }}</span>
            <span
              v-if="item.description"
              class="truncate text-xs text-muted"
            >
              {{ item.description }}
            </span>
          </span>
        </li>
      </ul>

      <slot
        v-if="isOpen && items.length === 0"
        name="empty"
      />
    </div>
  </div>
</template>
