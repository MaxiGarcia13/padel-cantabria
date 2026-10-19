<script setup lang="ts">
import { Button } from '@/components/ui/button';
import { CHAT_SUGGESTIONS } from '@/domain/chat-suggestions';

defineProps<{
  disabled?: boolean;
}>();

const emit = defineEmits<{
  select: [prompt: string];
}>();
</script>

<template>
  <div class="flex w-full max-w-sm flex-col items-stretch gap-2">
    <Button
      v-for="suggestion in CHAT_SUGGESTIONS"
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
