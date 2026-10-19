<script setup lang="ts">
import { Markdown } from '@comark/vue';
import { MessageCircleDashedIcon } from '@lucide/vue';
import { Bubble, BubbleContent } from '@/components/ui/bubble';
import {
  Empty,
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

defineProps<{
  messages: Array<{
    id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
  }>;
  busy?: boolean;
}>();
</script>

<template>
  <MessageScrollerProvider auto-scroll>
    <MessageScroller class="h-full min-h-0">
      <MessageScrollerViewport>
        <MessageScrollerContent
          :aria-busy="busy"
          class="gap-4 px-0 py-4"
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
                Cuando el modelo esté listo, escribe tu pregunta abajo.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>

          <MessageScrollerItem
            v-for="(message, index) in messages"
            :key="message.id"
            :message-id="message.id"
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
        </MessageScrollerContent>
      </MessageScrollerViewport>
      <MessageScrollerButton />
    </MessageScroller>
  </MessageScrollerProvider>
</template>
