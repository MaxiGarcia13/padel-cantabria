export function parseNumber(value: string | null | undefined): number {
  if (!value)
    return 0;
  const parsed = Number.parseFloat(value);
  return Number.isFinite(parsed) ? parsed : 0;
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
  return parent ? getPadding(parent) : { end: 0, start: 0 };
}

export function getRowGap(element: HTMLElement | null): number {
  if (!element)
    return 0;
  const style = window.getComputedStyle(element);
  const gap = style.rowGap === 'normal' ? style.gap : style.rowGap;
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
