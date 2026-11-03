<script setup lang="ts">
import { ArrowUpIcon } from '@lucide/vue';
import { ref } from 'vue';
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from '@/components/ui/input-group';
import { Spinner } from '@/components/ui/spinner';

const props = defineProps<{
  disabled: boolean;
  busy: boolean;
}>();

const emit = defineEmits<{
  send: [prompt: string];
}>();

const prompt = ref('');

function submit() {
  if (props.disabled) {
    return;
  }

  const value = prompt.value.trim();
  if (!value) {
    return;
  }

  prompt.value = '';
  emit('send', value);
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    submit();
  }
}
</script>

<template>
  <form
    class="pt-2"
    @submit.prevent="submit"
  >
    <label
      class="sr-only"
      for="prompt"
    >
      Mensaje
    </label>
    <InputGroup>
      <InputGroupTextarea
        id="prompt"
        v-model="prompt"
        rows="2"
        placeholder="Ej.: ¿Cuál es el próximo partido de…?"
        class="min-h-14 p-4"
        :disabled="disabled"
        @keydown="onKeydown"
      />
      <InputGroupAddon align="block-end">
        <InputGroupButton
          type="submit"
          size="icon-sm"
          variant="default"
          class="ml-auto rounded-full"
          :disabled="disabled || !prompt.trim()"
          aria-label="Enviar"
          @click="submit"
        >
          <Spinner v-if="busy" />
          <ArrowUpIcon v-else />
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  </form>
</template>
