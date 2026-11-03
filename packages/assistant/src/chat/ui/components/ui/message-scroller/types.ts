import type { ComputedRef, ShallowRef } from 'vue';

export type MessageScrollerDefaultScrollPosition = 'start' | 'end' | 'last-anchor';
export type MessageScrollerButtonDirection = 'start' | 'end';
export type MessageScrollerScrollAlign = 'start' | 'center' | 'end' | 'nearest';

export interface MessageScrollerScrollOptions {
  align?: MessageScrollerScrollAlign;
  behavior?: ScrollBehavior;
  scrollMargin?: number;
}

export interface MessageScrollerScrollable {
  start: boolean;
  end: boolean;
}

export interface MessageScrollerProviderProps {
  autoScroll?: boolean;
  defaultScrollPosition?: MessageScrollerDefaultScrollPosition;
  scrollEdgeThreshold?: number;
  scrollPreviousItemPeek?: number;
  scrollMargin?: number;
}

export interface MessageScrollerContext {
  autoscrolling: Readonly<ShallowRef<boolean>>;
  scrollable: Readonly<ShallowRef<MessageScrollerScrollable>>;
  scrollableAttr: ComputedRef<string | undefined>;
  handleContentChange: () => void;
  handleResize: () => void;
  scrollToEnd: (options?: { behavior?: ScrollBehavior }) => boolean;
  scrollToMessage: (messageId: string, options?: MessageScrollerScrollOptions) => boolean;
  scrollToStart: (options?: { behavior?: ScrollBehavior }) => boolean;
  setContentElement: (element: HTMLElement | null) => void;
  setSpacerElement: (element: HTMLElement | null) => void;
  setViewportElement: (element: HTMLElement | null) => void;
  setPreserveScrollOnPrepend: (value: boolean) => void;
  syncAfterScroll: () => void;
  userScrollIntent: () => void;
}

export type RegisterMessage = (
  messageId: string,
  element: HTMLElement | null,
  previousElement: HTMLElement | null,
) => void;
