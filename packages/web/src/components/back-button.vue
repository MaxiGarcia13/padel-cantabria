<script setup lang="ts">
import { navigate } from 'astro:transitions/client';
import Button from '@/components/button.vue';
import ChevronLeftIcon from '@/components/icons/chevron-left-icon.vue';

function goBack(): void {
  if (window.history.length > 1) {
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
    size="icon-sm"
    aria-label="Volver"
    @click="goBack"
  >
    <ChevronLeftIcon class="size-6" />
  </Button>
</template>
