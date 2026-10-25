<script setup lang="ts">
import { onCircularRevealAnimation } from '@maxigarcia/view-transitions';
import MoonIcon from '@/components/icons/moon-icon.vue';
import SunIcon from '@/components/icons/sun-icon.vue';
import { Button } from '@/components/ui/button';
import { toggleTheme } from '@/utils/theme';

function onToggle(event: MouseEvent): void {
  onCircularRevealAnimation(() => {
    toggleTheme();
  }, event);
}
</script>

<template>
  <Button
    type="button"
    variant="ghost"
    size="icon-sm"
    aria-label="Cambiar tema"
    @click="onToggle"
  >
    <SunIcon class="hidden size-5 dark:block" />
    <MoonIcon class="block size-5 dark:hidden" />
  </Button>
</template>
