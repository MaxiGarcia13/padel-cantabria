import type { Ref } from 'vue';
import type { MessageScrollerScrollable } from '@/components/ui/message-scroller/types';
import { computed } from 'vue';
import { useMessageScrollerContext } from '@/components/ui/message-scroller/message-scroller-context';

export function useMessageScroller() {
  const { scrollToEnd, scrollToMessage, scrollToStart } = useMessageScrollerContext();
  return { scrollToEnd, scrollToMessage, scrollToStart };
}

export function useMessageScrollerScrollable(): Ref<MessageScrollerScrollable> {
  const { scrollable } = useMessageScrollerContext();
  return computed(() => scrollable.value);
}
