<script setup lang="ts">
import { Button } from '@chat/ui/components/ui/button';

defineProps<{
  suggestions: string[];
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [prompt: string];
}>();
</script>

<template>
  <div
    v-if="suggestions.length > 0"
    class="flex w-full max-w-sm flex-col items-stretch gap-2"
  >
    <Button
      v-for="suggestion in suggestions"
      :key="suggestion"
      type="button"
      variant="outline"
      class="h-auto justify-start rounded-xl px-4 py-2 text-left whitespace-normal"
      :disabled="disabled"
      @click="emit('select', suggestion)"
    >
      {{ suggestion }}
    </Button>
  </div>
</template>
