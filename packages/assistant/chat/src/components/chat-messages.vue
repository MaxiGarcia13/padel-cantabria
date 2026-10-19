<script setup lang="ts">
import { Markdown } from '@comark/vue';
import { MessageCircleDashedIcon } from '@lucide/vue';
import { computed } from 'vue';
import ChatSuggestions from '@/components/chat-suggestions.vue';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';
import { Message, MessageContent } from '@/components/ui/message';
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from '@/components/ui/message-scroller';

const props = defineProps<{
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  busy?: boolean;
  suggestionsDisabled?: boolean;
}>();

const emit = defineEmits<{
  suggest: [prompt: string];
}>();

const showSuggestions = computed(() =>
  props.messages.every((message) => message.role === 'system'),
);
</script>

<template>
  <MessageScrollerProvider auto-scroll>
    <MessageScroller class="h-full min-h-0">
      <MessageScrollerViewport>
        <MessageScrollerContent
          :aria-busy="busy"
          class="mx-auto w-full max-w-xl gap-4 px-4 py-4"
        >
          <Empty
            v-if="messages.length === 0"
            class="border-0"
          >
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MessageCircleDashedIcon />
              </EmptyMedia>
              <EmptyTitle>
                Sin mensajes
              </EmptyTitle>
              <EmptyDescription>
                Cuando el modelo esté listo, elige una sugerencia o escribe tu pregunta abajo.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent
              v-if="showSuggestions"
              class="mt-4 max-w-md gap-2"
            >
              <ChatSuggestions
                :disabled="suggestionsDisabled"
                @select="emit('suggest', $event)"
              />
            </EmptyContent>
          </Empty>

          <template v-else>
            <MessageScrollerItem
              v-for="(message, index) in messages"
              :key="message.id"
              :message-id="message.id"
              scroll-anchor
            >
              <p
                v-if="message.role === 'system'"
                class="mx-auto max-w-[90%] text-center text-sm text-muted-foreground"
              >
                {{ message.content }}
              </p>

              <Message
                v-else-if="message.role === 'user'"
                align="end"
              >
                <MessageContent>
                  <Bubble
                    align="end"
                    variant="muted"
                  >
                    <BubbleContent class="whitespace-pre-wrap">
                      {{ message.content }}
                    </BubbleContent>
                  </Bubble>
                </MessageContent>
              </Message>

              <Message v-else>
                <MessageContent class="gap-2">
                  <Suspense>
                    <Markdown
                      class="typeset typeset-chat max-w-[90%]"
                      :value="message.content"
                      :streaming="busy && index === messages.length - 1"
                    />
                  </Suspense>
                </MessageContent>
              </Message>
            </MessageScrollerItem>

            <div
              v-if="showSuggestions"
              class="flex justify-center"
            >
              <ChatSuggestions
                :disabled="suggestionsDisabled"
                @select="emit('suggest', $event)"
              />
            </div>
          </template>
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  </MessageScrollerProvider>
</template>
