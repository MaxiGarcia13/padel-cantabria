import type { CSSProperties, Ref } from 'vue';
import { onBeforeUnmount, ref, watch } from 'vue';

const LIST_GAP_PX = 8;

export function useFloatingAnchor(
  anchorRef: Ref<HTMLElement | null>,
  isOpen: Ref<boolean>,
) {
  const style = ref<CSSProperties>({});
  const teleportTo = ref<string | HTMLElement>('body');

  function updatePosition(): void {
    const anchor = anchorRef.value;

    if (!anchor) {
      return;
    }

    const rect = anchor.getBoundingClientRect();

    style.value = {
      position: 'fixed',
      top: `${rect.bottom + LIST_GAP_PX}px`,
      left: `${rect.left}px`,
      width: `${rect.width}px`,
    };
    teleportTo.value = anchor.closest('dialog') ?? 'body';
  }

  function onScrollOrResize(): void {
    if (isOpen.value) {
      updatePosition();
    }
  }

  watch(isOpen, (open) => {
    if (open) {
      updatePosition();
      window.addEventListener('resize', onScrollOrResize);
      document.addEventListener('scroll', onScrollOrResize, true);
      return;
    }

    window.removeEventListener('resize', onScrollOrResize);
    document.removeEventListener('scroll', onScrollOrResize, true);
  });

  onBeforeUnmount(() => {
    window.removeEventListener('resize', onScrollOrResize);
    document.removeEventListener('scroll', onScrollOrResize, true);
  });

  return { style, teleportTo, updatePosition };
}
