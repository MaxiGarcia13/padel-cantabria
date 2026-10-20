import type { MessageScrollerScrollOptions } from '../types';
import type { EngineState } from './engine-state';
import {
  computeSpacerHeight,
  getRelativeTop,
  getRowGap,
} from '../dom/measure';
import { computeScrollTopForElement } from '../dom/scroll-target';
import { isNear, maxScrollTop } from '../dom/scrollable';
import {
  commitScrollState,
  scheduleStateCommit,
  setAutoscrolling,
} from './mode-and-scroll-state';

export function setSpacerHeight(state: EngineState, height: number) {
  if (!state.spacer)
    return;
  const next = Math.max(0, Math.ceil(height));
  if (state.spacerHeight === next)
    return;
  state.spacerHeight = next;
  state.spacer.hidden = next === 0;
  state.spacer.style.height = `${next}px`;
  state.spacer.style.marginTop = next > 0 ? `${-state.spacerGap}px` : '';
}

export function scrollTo(
  state: EngineState,
  top: number,
  {
    behavior = 'auto',
    autoscrolling: isAutoscrolling = false,
  }: {
    behavior?: ScrollBehavior;
    autoscrolling?: boolean;
  } = {},
) {
  if (!state.viewport)
    return;
  const target = Math.max(0, top);
  if (isNear(state.viewport.scrollTop, target)) {
    state.viewport.scrollTop = target;
    commitScrollState(state);
    return;
  }
  if (isAutoscrolling)
    setAutoscrolling(state, true);
  state.viewport.scrollTo({ top: target, behavior });
  scheduleStateCommit(state);
}

export function scrollToStart(
  state: EngineState,
  { behavior = 'auto' }: { behavior?: ScrollBehavior } = {},
): boolean {
  if (!state.viewport)
    return false;
  setSpacerHeight(state, 0);
  state.streamingTurn = null;
  state.mode = 'free-scrolling';
  scrollTo(state, 0, { behavior });
  return true;
}

export function scrollToEnd(
  state: EngineState,
  { behavior = 'auto' }: { behavior?: ScrollBehavior } = {},
): boolean {
  if (!state.viewport)
    return false;
  setSpacerHeight(state, 0);
  state.streamingTurn = null;
  state.mode = state.autoScroll() ? 'following-bottom' : 'free-scrolling';
  scrollTo(state, maxScrollTop(state.viewport), { autoscrolling: true, behavior });
  return true;
}

export function scrollToElement(
  state: EngineState,
  element: HTMLElement,
  {
    align = 'start',
    behavior = 'auto',
    scrollMargin: margin = state.scrollMargin(),
  }: MessageScrollerScrollOptions = {},
  { keepPreviousPeek = false }: { keepPreviousPeek?: boolean } = {},
): boolean {
  if (!state.content || !state.viewport || !state.content.contains(element))
    return false;
  const targetScrollTop = computeScrollTopForElement({
    align,
    element,
    scrollMargin: keepPreviousPeek ? margin + state.scrollPreviousItemPeek() : margin,
    spacer: state.spacer,
    viewport: state.viewport,
  });
  setSpacerHeight(state, computeSpacerHeight({
    content: state.content,
    scrollTop: targetScrollTop,
    spacer: state.spacer,
    viewport: state.viewport,
  }));
  state.prependRestore = {
    element,
    viewportTop: getRelativeTop(element, state.viewport),
  };
  state.mode = keepPreviousPeek ? 'anchored-to-message' : 'settling-jump';
  state.streamingTurn = keepPreviousPeek ? element : null;
  scrollTo(state, targetScrollTop, { behavior });
  return true;
}

export function reanchorToAnchoredMessage(state: EngineState): boolean {
  if (!state.streamingTurn || !state.streamingTurn.isConnected || state.mode !== 'anchored-to-message')
    return false;
  return scrollToElement(state, state.streamingTurn, { align: 'start' }, { keepPreviousPeek: true });
}

export function scrollToMessage(
  state: EngineState,
  messageId: string,
  options?: MessageScrollerScrollOptions,
): boolean {
  const element = state.messageElements.get(messageId);
  if (element) {
    state.defaultScrollPositionApplied = true;
    if (scrollToElement(state, element, options)) {
      state.pendingScrollToMessage = null;
      return true;
    }
    state.pendingScrollToMessage = { messageId, options };
    return true;
  }
  if (state.itemCount === 0) {
    state.pendingScrollToMessage = { messageId, options };
    state.defaultScrollPositionApplied = true;
    return true;
  }
  return false;
}

export function flushPendingScrollToMessage(state: EngineState): boolean {
  if (!state.pendingScrollToMessage)
    return false;
  const element = state.messageElements.get(state.pendingScrollToMessage.messageId);
  if (!element || !scrollToElement(state, element, state.pendingScrollToMessage.options))
    return false;
  state.pendingScrollToMessage = null;
  state.defaultScrollPositionApplied = true;
  return true;
}

export function setSpacerElement(state: EngineState, element: HTMLElement | null) {
  state.spacer = element;
  state.spacerGap = getRowGap(element?.parentElement ?? null);
}
