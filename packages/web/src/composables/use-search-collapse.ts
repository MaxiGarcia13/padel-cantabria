import type { Ref } from 'vue';
import { onMounted, onUnmounted, ref, watch } from 'vue';

function pathHasResults(pathname: string): boolean {
  const segments = pathname.split('/').filter(Boolean);

  return segments[0] === 'league' || segments[0] === 'team';
}

export function useSearchCollapse(collapsibleProp: Ref<boolean | undefined>) {
  const isCollapsible = ref(Boolean(collapsibleProp.value));
  const isExpanded = ref(!isCollapsible.value);

  function syncFromLocation(): void {
    const onResults = pathHasResults(window.location.pathname);
    isCollapsible.value = onResults;
    isExpanded.value = !onResults;
  }

  function toggleExpanded(): void {
    isExpanded.value = !isExpanded.value;
  }

  watch(collapsibleProp, (collapsible) => {
    isCollapsible.value = Boolean(collapsible);
    isExpanded.value = !collapsible;
  });

  onMounted(() => {
    syncFromLocation();
    document.addEventListener('astro:page-load', syncFromLocation);
  });

  onUnmounted(() => {
    document.removeEventListener('astro:page-load', syncFromLocation);
  });

  return {
    isCollapsible,
    isExpanded,
    toggleExpanded,
  };
}
