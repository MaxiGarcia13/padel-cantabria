<script setup lang="ts">
import ChatComposer from './components/chat-composer.vue';
import ChatMessages from './components/chat-messages.vue';
import { useAssistantChat } from './composables/use-assistant-chat';

const {
  status,
  statusTone,
  busy,
  messages,
  canSend,
  send,
} = useAssistantChat();
</script>

<template>
  <div class="mx-auto grid h-dvh max-w-xl grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden px-4 py-6">
    <header>
      <h1 class="mb-2 text-3xl tracking-tight">
        Asistente Padel Cantabria
      </h1>
      <p class="m-0 leading-snug text-muted-foreground">
        Pregunta por equipos, clasificaciones, jugadores y próximos partidos.
        Los datos salen del MCP del servidor.
      </p>
      <p
        class="mt-2 text-sm leading-snug"
        :class="statusTone === 'error' ? 'text-danger' : 'text-muted-foreground'"
        aria-live="polite"
      >
        {{ status }}
      </p>
    </header>

    <ChatMessages
      :messages="messages"
      :busy="busy"
    />

    <ChatComposer
      :disabled="!canSend"
      :busy="busy"
      @send="send"
    />
  </div>
</template>
