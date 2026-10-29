import type { MessageScrollerScrollable, MessageScrollerScrollOptions } from '../types';
import type { EngineState } from './state';
import { AUTOSCROLLING_TIMEOUT, SCROLL_EPSILON } from '../constants';
import {
  computeScrollable,
  computeScrollTopForElement,
  computeSpacerHeight,
  getRelativeTop,
  getRowGap,
  isNear,
  maxScrollTop,
  scrollableEqual,
} from '../dom';

export function updateModeFromScroll(state: EngineState, next: MessageScrollerScrollable) {
  const scrollTop = state.viewport?.scrollTop ?? 0;
  const scrolledUp = scrollTop < state.lastScrollTop - SCROLL_EPSILON;
  state.lastScrollTop = scrollTop;
  if (
    state.autoScroll()
    && !next.end
    && state.mode !== 'settling-jump'
    && state.mode !== 'anchored-to-message'
  ) {
    state.mode = 'following-bottom';
  } else if (
    state.mode === 'following-bottom'
    && next.end
    && scrolledUp
    && !state.autoscrolling.value
  ) {
    state.mode = 'free-scrolling';
  }
}

export function commitScrollState(state: EngineState) {
  const measured = computeScrollable({
    content: state.content,
    scrollEdgeThreshold: state.scrollEdgeThreshold(),
    spacer: state.spacer,
    viewport: state.viewport,
  });
  updateModeFromScroll(state, measured);
  const next = state.mode === 'following-bottom'
    ? { ...measured, end: false }
    : measured;
  if (!scrollableEqual(state.scrollable.value, next))
    state.scrollable.value = next;
}

export function scheduleStateCommit(state: EngineState) {
  if (state.stateFrame !== null)
    return;
  state.stateFrame = window.requestAnimationFrame(() => {
    state.stateFrame = null;
    commitScrollState(state);
  });
}

export function setAutoscrolling(state: EngineState, active: boolean) {
  if (state.autoscrollingTimeout !== null) {
    window.clearTimeout(state.autoscrollingTimeout);
    state.autoscrollingTimeout = null;
  }
  if (state.autoscrolling.value !== active) {
    state.autoscrolling.value = active;
    commitScrollState(state);
  }
  if (!active)
    return;
  state.autoscrollingTimeout = window.setTimeout(() => {
    state.autoscrollingTimeout = null;
    state.autoscrolling.value = false;
    commitScrollState(state);
  }, AUTOSCROLLING_TIMEOUT);
}

export function setSpacerHeight(state: EngineState, height: number) {
  if (!state.spacer)
    return;
  const next = Math.max(0, Math.ceil(height));
  if (state.spacerHeight === next)
    return;
  state.spacerHeight = next;
  state.spacer.hidden = next === 0;
  state.spacer.style.height = `${next}px`;
  state.spacer.style.marginTop = next > 0
    ? `${-state.spacerGap}px`
    : '';
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
  state.mode = state.autoScroll()
    ? 'following-bottom'
    : 'free-scrolling';
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
    scrollMargin: keepPreviousPeek
      ? margin + state.scrollPreviousItemPeek()
      : margin,
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
