import type { Ref } from 'vue';
import type { AutocompleteItem } from './types';
import { computed, onMounted, ref, useSlots, watch } from 'vue';
import { useFloatingAnchor } from '@/composables/use-floating-anchor';

export function useAutocomplete(options: {
  id: string;
  items: Ref<AutocompleteItem[]>;
  disabled: Ref<boolean>;
  loading: Ref<boolean>;
  emitUpdate: (value: string) => void;
  emitSelect: (item: AutocompleteItem) => void;
}) {
  const isDisabled = computed(
    () => options.disabled.value || options.loading.value,
  );

  const slots = useSlots();
  const isClient = ref(false);
  const isOpen = ref(false);
  const activeIndex = ref(-1);
  const inputRef = ref<HTMLInputElement | null>(null);
  const listboxId = `${options.id}-listbox`;

  const { style: floatingStyle, teleportTo, updatePosition } = useFloatingAnchor(
    inputRef,
    isOpen,
  );

  onMounted(() => {
    isClient.value = true;
  });

  const showResults = computed(
    () => isOpen.value && options.items.value.length > 0,
  );
  const showEmpty = computed(
    () =>
      isOpen.value
      && options.items.value.length === 0
      && Boolean(slots.empty),
  );
  const showFloating = computed(() => showResults.value || showEmpty.value);

  watch(showFloating, (visible) => {
    if (visible) {
      updatePosition();
    }
  });

  function onInput(event: Event): void {
    const value = (event.target as HTMLInputElement).value;

    options.emitUpdate(value);
    isOpen.value = true;
    activeIndex.value = -1;
  }

  function selectItem(item: AutocompleteItem): void {
    options.emitUpdate(item.label);
    options.emitSelect(item);
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
        options.items.value.length - 1,
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
      const item = options.items.value[activeIndex.value];

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

  return {
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
  };
}
