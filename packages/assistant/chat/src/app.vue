<script setup lang="ts">
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
  MLCEngineInterface,
} from '@mlc-ai/web-llm';
import type { PendingClarification } from './domain/clarification';
import { CreateMLCEngine, prebuiltAppConfig } from '@mlc-ai/web-llm';
import { computed, onMounted, ref } from 'vue';
import { Progress } from '@/components/ui/progress';
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
import { McpBrowserClient } from './utils/mcp-client';
import { trimChatHistory } from './utils/trim-chat-history';

const MODEL_ID = 'Hermes-2-Pro-Llama-3-8B-q4f16_1-MLC';

/** Cache API needs a secure context; IndexedDB works more reliably on localhost HTTP. */
const APP_CONFIG = {
  ...prebuiltAppConfig,
  cacheBackend: 'indexeddb' as const,
};

interface UiMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
}

const status = ref('Preparando…');
const statusTone = ref<'info' | 'error'>('info');
const progress = ref(0);
const showProgress = ref(false);
const ready = ref(false);
const busy = ref(false);
const messages = ref<UiMessage[]>([]);
const history = ref<ChatCompletionMessageParam[]>([]);
const pendingClarification = ref<PendingClarification | null>(null);

const mcp = new McpBrowserClient('/mcp');
let engine: MLCEngineInterface | null = null;
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

    status.value = 'Descargando modelo en el navegador…';
    showProgress.value = true;

    engine = await CreateMLCEngine(MODEL_ID, {
      appConfig: APP_CONFIG,
      initProgressCallback: (report) => {
        status.value = report.text;
        progress.value = Math.round((report.progress ?? 0) * 100);
      },
    });

    showProgress.value = false;
    ready.value = true;
    statusTone.value = 'info';
    status.value = `Listo · ${mcpTools.length} herramientas MCP · modelo local`;
    pushMessage(
      'system',
      'Puedes preguntar por categorías, equipos, posiciones, jugadores y próximos partidos.',
    );
  } catch (error) {
    showProgress.value = false;
    statusTone.value = 'error';
    status.value
      = error instanceof Error
        ? error.message
        : 'No se pudo iniciar el asistente';
  }
}

async function onSend(prompt: string) {
  if (!engine || !canSend.value) {
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
      engine,
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
        El modelo corre en tu navegador; los datos salen del MCP del servidor.
      </p>
      <p
        class="mt-2 text-sm leading-snug"
        :class="statusTone === 'error' ? 'text-danger' : 'text-muted-foreground'"
        aria-live="polite"
      >
        {{ status }}
      </p>
      <Progress
        v-show="showProgress"
        class="mt-2 h-2"
        :model-value="progress"
      />
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
