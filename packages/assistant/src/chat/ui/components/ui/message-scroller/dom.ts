import type {
  MessageScrollerScrollable,
  MessageScrollerScrollAlign,
} from './types';
import { SCROLL_EPSILON } from './constants';

export const EMPTY_SCROLLABLE: MessageScrollerScrollable = {
  start: false,
  end: false,
};

export function parseNumber(value: string | null | undefined): number {
  if (!value)
    return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed)
    ? parsed
    : 0;
}

export function getPadding(element: HTMLElement): { start: number; end: number } {
  const style = window.getComputedStyle(element);
  return {
    end: parseNumber(style.paddingBlockEnd || style.paddingBottom),
    start: parseNumber(style.paddingBlockStart || style.paddingTop),
  };
}

export function getContentPadding(spacer: HTMLElement | null): {
  start: number;
  end: number;
} {
  const parent = spacer?.parentElement;
  return parent
    ? getPadding(parent)
    : { end: 0, start: 0 };
}

export function getRowGap(element: HTMLElement | null): number {
  if (!element)
    return 0;
  const style = window.getComputedStyle(element);
  const gap = style.rowGap === 'normal'
    ? style.gap
    : style.rowGap;
  return parseNumber(gap);
}

export function getMessageChildren(
  content: HTMLElement,
  spacer: HTMLElement | null,
): HTMLElement[] {
  return Array.from(content.children).filter(
    (child): child is HTMLElement =>
      child instanceof HTMLElement && child !== spacer,
  );
}

export function getElementOffsetTop(element: HTMLElement, viewport: HTMLElement): number {
  const elementRect = element.getBoundingClientRect();
  const viewportRect = viewport.getBoundingClientRect();
  return elementRect.top - viewportRect.top + viewport.scrollTop;
}

export function getRelativeTop(element: HTMLElement, viewport: HTMLElement): number {
  return element.getBoundingClientRect().top - viewport.getBoundingClientRect().top;
}

export function measureContentHeight({
  content,
  spacer,
  viewport,
}: {
  content: HTMLElement;
  spacer: HTMLElement | null;
  viewport: HTMLElement;
}): number {
  const children = getMessageChildren(content, spacer);
  const padding = getPadding(content);
  const viewportRect = viewport.getBoundingClientRect();
  const scrollTop = viewport.scrollTop;
  let height = padding.start + padding.end;
  for (const child of children) {
    const rect = child.getBoundingClientRect();
    height = Math.max(height, rect.bottom - viewportRect.top + scrollTop + padding.end);
  }
  return height;
}

export function computeSpacerHeight({
  content,
  scrollTop,
  spacer,
  viewport,
}: {
  content: HTMLElement;
  scrollTop: number;
  spacer: HTMLElement | null;
  viewport: HTMLElement;
}): number {
  const contentHeight = measureContentHeight({ content, spacer, viewport });
  return scrollTop + viewport.clientHeight - contentHeight;
}

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

export function computeScrollTopForElement({
  align,
  element,
  scrollMargin,
  spacer,
  viewport,
}: {
  align: MessageScrollerScrollAlign;
  element: HTMLElement;
  scrollMargin: number;
  spacer: HTMLElement | null;
  viewport: HTMLElement;
}): number {
  const offsetTop = getElementOffsetTop(element, viewport);
  const height = element.getBoundingClientRect().height;
  const padding = getContentPadding(spacer);

  if (align === 'center') {
    const available = Math.max(0, viewport.clientHeight - padding.start - padding.end);
    return offsetTop - padding.start - (available - height) / 2 - scrollMargin;
  }
  if (align === 'end')
    return offsetTop - viewport.clientHeight + height + padding.end + scrollMargin;
  if (align === 'nearest') {
    const bottom = offsetTop + height;
    const visibleTop = viewport.scrollTop + padding.start;
    const visibleBottom = viewport.scrollTop + viewport.clientHeight - padding.end;
    if (offsetTop >= visibleTop && bottom <= visibleBottom)
      return viewport.scrollTop;
    return offsetTop < visibleTop
      ? offsetTop - padding.start - scrollMargin
      : bottom - viewport.clientHeight + padding.end + scrollMargin;
  }
  return offsetTop - padding.start - scrollMargin;
}

export function findScrollAnchor(
  elements: HTMLElement[],
  {
    fromIndex = 0,
    unhandled,
  }: {
    fromIndex?: number;
    unhandled?: WeakSet<HTMLElement>;
  } = {},
): HTMLElement | null {
  for (let i = fromIndex; i < elements.length; i++) {
    const element = elements[i];
    if (element?.dataset.scrollAnchor !== 'true')
      continue;
    if (unhandled?.has(element))
      continue;
    return element;
  }
  return null;
}

export function findLastAnchor(elements: HTMLElement[]): HTMLElement | null {
  for (let i = elements.length - 1; i >= 0; i--) {
    const element = elements[i];
    if (element?.dataset.scrollAnchor === 'true')
      return element;
  }
  return null;
}

export function findFirstVisibleMessage({
  content,
  spacer,
  viewport,
}: {
  content: HTMLElement;
  spacer: HTMLElement | null;
  viewport: HTMLElement;
}): HTMLElement | null {
  const viewportRect = viewport.getBoundingClientRect();
  for (const child of getMessageChildren(content, spacer)) {
    if (!child.dataset.messageId)
      continue;
    const rect = child.getBoundingClientRect();
    if (rect.bottom > viewportRect.top && rect.top < viewportRect.bottom)
      return child;
  }
  return null;
}
