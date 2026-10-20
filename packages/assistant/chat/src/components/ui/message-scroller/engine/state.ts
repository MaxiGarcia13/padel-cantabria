import type { ComputedRef, ShallowRef } from 'vue';
import type {
  MessageScrollerProviderProps,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
} from '../types';
import { computed, shallowRef } from 'vue';
import {
  DEFAULT_SCROLL_EDGE_THRESHOLD,
  DEFAULT_SCROLL_MARGIN,
  DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK,
} from '../constants';
import { EMPTY_SCROLLABLE } from '../dom';

export type Mode
  = | 'following-bottom'
    | 'free-scrolling'
    | 'anchored-to-message'
    | 'settling-jump';

export interface PrependRestore {
  element: HTMLElement;
  viewportTop: number;
}

export interface PendingScrollToMessage {
  messageId: string;
  options?: MessageScrollerScrollOptions;
}

export interface EngineState {
  autoScroll: () => boolean;
  defaultScrollPosition: () => NonNullable<MessageScrollerProviderProps['defaultScrollPosition']>;
  scrollEdgeThreshold: () => number;
  scrollPreviousItemPeek: () => number;
  scrollMargin: () => number;
  viewport: HTMLElement | null;
  content: HTMLElement | null;
  spacer: HTMLElement | null;
  spacerGap: number;
  spacerHeight: number;
  mode: Mode;
  streamingTurn: HTMLElement | null;
  firstItem: HTMLElement | null;
  itemCount: number;
  lastScrollTop: number;
  defaultScrollPositionApplied: boolean;
  preserveScrollOnPrepend: boolean;
  prependRestore: PrependRestore | null;
  pendingScrollToMessage: PendingScrollToMessage | null;
  stateFrame: number | null;
  pendingScrollFrame: number | null;
  autoscrollingTimeout: number | null;
  messageElements: Map<string, HTMLElement>;
  handledScrollAnchors: WeakSet<HTMLElement>;
  autoscrolling: ShallowRef<boolean>;
  scrollable: ShallowRef<MessageScrollerScrollable>;
  scrollableAttr: ComputedRef<string | undefined>;
}

export function createEngineState(props: MessageScrollerProviderProps): EngineState {
  const autoscrolling = shallowRef(false);
  const scrollable = shallowRef<MessageScrollerScrollable>(EMPTY_SCROLLABLE);
  const scrollableAttr = computed(() => {
    const attr = [scrollable.value.start && 'start', scrollable.value.end && 'end']
      .filter(Boolean)
      .join(' ');
    return attr || undefined;
  });

  const autoScroll = () => props.autoScroll ?? false;

  return {
    autoScroll,
    defaultScrollPosition: () => props.defaultScrollPosition ?? 'end',
    scrollEdgeThreshold: () => props.scrollEdgeThreshold ?? DEFAULT_SCROLL_EDGE_THRESHOLD,
    scrollPreviousItemPeek: () => props.scrollPreviousItemPeek ?? DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK,
    scrollMargin: () => props.scrollMargin ?? DEFAULT_SCROLL_MARGIN,
    viewport: null,
    content: null,
    spacer: null,
    spacerGap: 0,
    spacerHeight: 0,
    mode: autoScroll() ? 'following-bottom' : 'free-scrolling',
    streamingTurn: null,
    firstItem: null,
    itemCount: 0,
    lastScrollTop: 0,
    defaultScrollPositionApplied: false,
    preserveScrollOnPrepend: true,
    prependRestore: null,
    pendingScrollToMessage: null,
    stateFrame: null,
    pendingScrollFrame: null,
    autoscrollingTimeout: null,
    messageElements: new Map(),
    handledScrollAnchors: new WeakSet(),
    autoscrolling,
    scrollable,
    scrollableAttr,
  };
}
