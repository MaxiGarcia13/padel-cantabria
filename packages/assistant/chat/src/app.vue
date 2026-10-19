<script setup lang="ts">
import type { PendingClarification } from './domain/clarification';
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from './utils/chat-completion-types';
import { computed, onMounted, ref } from 'vue';
import ChatComposer from './components/chat-composer.vue';
import ChatMessages from './components/chat-messages.vue';
import {
  ASK_GENDER_MESSAGE,
  asksForCategoryTeams,
  inferGenderFromText,
} from './domain/category-teams-intent';
import { asksForCategoryCatalog } from './domain/list-categories-intent';
import { resolvePendingCategoryPick } from './domain/resolve-pending-category';
import { runChatTurn } from './domain/run-chat-turn';
import { HttpChatCompletionsClient } from './utils/chat-completions-client';
import { McpBrowserClient } from './utils/mcp-client';
import { trimChatHistory } from './utils/trim-chat-history';

interface UiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const status = ref('Preparando…');
const statusTone = ref<'info' | 'error'>('info');
const ready = ref(false);
const busy = ref(false);
const messages = ref<UiMessage[]>([]);
const history = ref<ChatCompletionMessageParam[]>([]);
const pendingClarification = ref<PendingClarification | null>(null);

const mcp = new McpBrowserClient('/mcp');
const chatClient = new HttpChatCompletionsClient('/chat/completions');
let tools: ChatCompletionTool[] = [];

const canSend = computed(() => ready.value && !busy.value);

function pushMessage(role: UiMessage['role'], content: string) {
  messages.value.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    role,
    content,
  });
}

function commitTurn(userText: string, assistantText: string) {
  pushMessage('assistant', assistantText);
  history.value = trimChatHistory([
    ...history.value,
    { role: 'user', content: userText },
    { role: 'assistant', content: assistantText },
  ]);
}

async function bootstrap() {
  try {
    status.value = 'Conectando al MCP…';
    await mcp.connect();
    const mcpTools = await mcp.listTools();
    tools = mcp.toOpenAiTools(mcpTools);

    ready.value = true;
    statusTone.value = 'info';
    status.value = `Listo · ${mcpTools.length} herramientas MCP`;
    pushMessage(
      'system',
      'Puedes preguntar por categorías, equipos, posiciones, jugadores y próximos partidos.',
    );
  } catch (error) {
    statusTone.value = 'error';
    status.value
      = error instanceof Error
        ? error.message
        : 'No se pudo iniciar el asistente';
  }
}

async function onSend(prompt: string) {
  if (!canSend.value) {
    return;
  }

  const trimmed = prompt.trim();
  if (!trimmed) {
    return;
  }

  busy.value = true;
  pushMessage('user', trimmed);

  try {
    const pending = pendingClarification.value;
    let userMessage = trimmed;

    if (pending?.kind === 'gender') {
      if (asksForCategoryTeams(trimmed) || asksForCategoryCatalog(trimmed)) {
        // New question replaces the gender wait.
        pendingClarification.value = null;
      } else if (inferGenderFromText(trimmed)) {
        // Resume the original question with the stated gender.
        userMessage = `${pending.originalQuestion} ${trimmed}`;
        pendingClarification.value = null;
      } else {
        pendingClarification.value = pending;
        commitTurn(trimmed, ASK_GENDER_MESSAGE);
        return;
      }
    } else if (pending?.kind === 'category') {
      // A brand-new question replaces the pending pick.
      if (asksForCategoryTeams(trimmed) || asksForCategoryCatalog(trimmed)) {
        pendingClarification.value = null;
      } else {
        const resolved = await resolvePendingCategoryPick({
          mcp,
          pending,
          userReply: trimmed,
        });

        if (resolved) {
          pendingClarification.value = resolved.pending ?? null;
          commitTurn(trimmed, resolved.text);
          return;
        }

        pendingClarification.value = null;
      }
    }

    const result = await runChatTurn({
      client: chatClient,
      mcp,
      tools,
      history: history.value,
      userMessage,
    });

    pendingClarification.value = result.pending ?? null;
    commitTurn(trimmed, result.text);
  } catch (error) {
    pendingClarification.value = null;
    pushMessage(
      'assistant',
      error instanceof Error
        ? `Error: ${error.message}`
        : 'Ha ocurrido un error al responder.',
    );
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  void bootstrap();
});
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
      @send="onSend"
    />
  </div>
</template>
