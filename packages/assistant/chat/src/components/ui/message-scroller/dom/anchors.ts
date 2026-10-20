import { getMessageChildren } from './measure';

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
