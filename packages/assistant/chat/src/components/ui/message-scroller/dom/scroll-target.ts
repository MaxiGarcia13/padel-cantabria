import type { MessageScrollerScrollAlign } from '../types';
import { getContentPadding, getElementOffsetTop } from './measure';

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
