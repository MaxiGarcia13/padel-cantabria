<script setup lang="ts">
import ChatComposer from './components/chat-composer.vue';
import ChatHeaderStatus from './components/chat-header-status.vue';
import ChatHeader from './components/chat-header.vue';
import ChatMessages from './components/chat-messages.vue';
import { useAssistantChat } from './composables/use-assistant-chat';

const {
  status,
  statusTone,
  busy,
  messages,
  canSend,
  starterSuggestions,
  relatedSuggestions,
  send,
} = useAssistantChat();
</script>

<template>
  <div class="grid h-dvh grid-rows-[auto_minmax(0,1fr)_auto] gap-4 overflow-hidden py-6">
    <header class="mx-auto w-full max-w-xl px-4">
      <ChatHeader />
      <ChatHeaderStatus
        :status="status"
        :status-tone="statusTone"
      />
    </header>

    <ChatMessages
      :messages="messages"
      :busy="busy"
      :suggestions-disabled="!canSend"
      :starter-suggestions="starterSuggestions"
      :related-suggestions="relatedSuggestions"
      @suggest="send"
    />

    <div class="mx-auto w-full max-w-xl px-4">
      <ChatComposer
        :disabled="!canSend"
        :busy="busy"
        @send="send"
      />
    </div>
  </div>
</template>
