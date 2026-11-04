import type { MessageScrollerScrollable } from '@chat/ui/components/ui/message-scroller/types';
import type { Ref } from 'vue';
import { useMessageScrollerContext } from '@chat/ui/components/ui/message-scroller/message-scroller-context';
import { computed } from 'vue';

export function useMessageScroller() {
  const { scrollToEnd, scrollToMessage, scrollToStart } = useMessageScrollerContext();
  return { scrollToEnd, scrollToMessage, scrollToStart };
}

export function useMessageScrollerScrollable(): Ref<MessageScrollerScrollable> {
  const { scrollable } = useMessageScrollerContext();
  return computed(() => scrollable.value);
}
