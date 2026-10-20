import type { MessageScrollerScrollable } from '../types';
import { SCROLL_EPSILON } from '../constants';
import { measureContentHeight } from './measure';

export const EMPTY_SCROLLABLE: MessageScrollerScrollable = { start: false, end: false };

export function maxScrollTop(element: HTMLElement): number {
  return Math.max(0, element.scrollHeight - element.clientHeight);
}

export function computeScrollable({
  content,
  scrollEdgeThreshold,
  spacer,
  viewport,
}: {
  content: HTMLElement | null;
  scrollEdgeThreshold: number;
  spacer: HTMLElement | null;
  viewport: HTMLElement | null;
}): MessageScrollerScrollable {
  if (!viewport || !content)
    return EMPTY_SCROLLABLE;
  const contentHeight = measureContentHeight({ content, spacer, viewport });
  return {
    start: viewport.scrollTop > scrollEdgeThreshold,
    end: contentHeight - viewport.scrollTop - viewport.clientHeight > scrollEdgeThreshold,
  };
}

export function scrollableEqual(a: MessageScrollerScrollable, b: MessageScrollerScrollable) {
  return a.start === b.start && a.end === b.end;
}

export function isNear(a: number, b: number) {
  return Math.abs(a - b) <= SCROLL_EPSILON;
}
