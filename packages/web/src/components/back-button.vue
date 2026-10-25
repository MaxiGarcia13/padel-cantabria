<script setup lang="ts">
import { navigate } from 'astro:transitions/client';
import ChevronLeftIcon from '@/components/icons/chevron-left-icon.vue';
import { Button } from '@/components/ui/button';

function canGoBack(): boolean {
  const historyIndex = (window.history.state as { index?: number } | null)?.index;
  return typeof historyIndex === 'number' && historyIndex > 0;
}

function goBack(): void {
  if (canGoBack()) {
    window.history.back();
    return;
  }

  void navigate('/');
}
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="sm"
    aria-label="Volver"
    class="w-fit justify-start! gap-1 self-start pl-0!"
    @click="goBack"
  >
    <ChevronLeftIcon class="size-5 shrink-0" />
    Volver
  </Button>
</template>
