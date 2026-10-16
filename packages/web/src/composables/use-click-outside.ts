import type { MaybeRefOrGetter } from 'vue';
import { onMounted, onUnmounted, toValue } from 'vue';

export function useClickOutside(
  elementRef: MaybeRefOrGetter<HTMLElement | null | undefined>,
  onClickOutside: () => void,
): void {
  function handlePointerDown(event: PointerEvent): void {
    const element = toValue(elementRef);
    const target = event.target;

    if (!element || !(target instanceof Node)) {
      return;
    }

    // Native <dialog> backdrop clicks have the dialog as the event target
    if (element instanceof HTMLDialogElement) {
      if (element.open && target === element) {
        onClickOutside();
      }

      return;
    }

    if (!element.contains(target)) {
      onClickOutside();
    }
  }

  onMounted(() => {
    document.addEventListener('pointerdown', handlePointerDown);
  });

  onUnmounted(() => {
    document.removeEventListener('pointerdown', handlePointerDown);
  });
}
