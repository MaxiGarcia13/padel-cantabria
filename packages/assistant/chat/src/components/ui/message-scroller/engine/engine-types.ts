import type { MessageScrollerScrollOptions } from '../types';

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
