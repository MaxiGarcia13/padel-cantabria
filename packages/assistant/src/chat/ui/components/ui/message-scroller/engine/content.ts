import type { EngineState } from './state';
import {
  findFirstVisibleMessage,
  findLastAnchor,
  findScrollAnchor,
  getElementOffsetTop,
  getMessageChildren,
  getRelativeTop,
  isNear,
  measureContentHeight,
} from '../dom';
import {
  commitScrollState,
  flushPendingScrollToMessage,
  reanchorToAnchoredMessage,
  scheduleStateCommit,
  scrollToElement,
  scrollToEnd,
  scrollToStart,
} from './scroll';

export function applyPrependRestore(state: EngineState): boolean {
  if (!state.prependRestore || !state.viewport || !state.prependRestore.element.isConnected)
    return false;
  const delta = getRelativeTop(state.prependRestore.element, state.viewport)
    - state.prependRestore.viewportTop;
  if (isNear(delta, 0))
    return false;
  state.viewport.scrollTop += delta;
  state.prependRestore.viewportTop = getRelativeTop(state.prependRestore.element, state.viewport);
  scheduleStateCommit(state);
  return true;
}

export function capturePrependAnchor(state: EngineState) {
  if (!state.content || !state.viewport) {
    state.prependRestore = null;
    return;
  }
  const element = findFirstVisibleMessage({
    content: state.content,
    spacer: state.spacer,
    viewport: state.viewport,
  });
  state.prependRestore = element
    ? {
        element,
        viewportTop: getRelativeTop(element, state.viewport),
      }
    : null;
}

export function schedulePendingScrollFlush(state: EngineState) {
  if (state.pendingScrollFrame !== null)
    return;
  state.pendingScrollFrame = window.requestAnimationFrame(() => {
    state.pendingScrollFrame = null;
    if (flushPendingScrollToMessage(state))
      capturePrependAnchor(state);
  });
}

export function applyDefaultScrollPosition(state: EngineState): boolean {
  if (state.defaultScrollPositionApplied || state.itemCount === 0)
    return false;

  const position = state.defaultScrollPosition();
  let applied = false;

  if (position === 'last-anchor') {
    const lastAnchor = state.content && state.viewport
      ? findLastAnchor(getMessageChildren(state.content, state.spacer))
      : null;
    if (!state.content || !state.viewport || !lastAnchor) {
      applied = scrollToEnd(state, { behavior: 'auto' });
    } else {
      const anchorOffset = getElementOffsetTop(lastAnchor, state.viewport);
      const contentHeight = measureContentHeight({
        content: state.content,
        spacer: state.spacer,
        viewport: state.viewport,
      });
      applied = contentHeight - anchorOffset <= state.viewport.clientHeight
        ? scrollToEnd(state, { behavior: 'auto' })
        : scrollToElement(state, lastAnchor, { align: 'start' }, { keepPreviousPeek: true });
    }
  } else {
    applied = position === 'end'
      ? scrollToEnd(state, { behavior: 'auto' })
      : scrollToStart(state, { behavior: 'auto' });
  }

  if (!applied)
    return false;
  state.defaultScrollPositionApplied = true;
  return true;
}

function followOrPinAnchor(state: EngineState, anchor: HTMLElement) {
  state.handledScrollAnchors.add(anchor);
  if (state.autoScroll() && state.mode === 'following-bottom') {
    scrollToEnd(state, { behavior: 'auto' });
    return;
  }
  scrollToElement(state, anchor, { align: 'start' }, { keepPreviousPeek: true });
}

function applyContentChange(
  state: EngineState,
  children: HTMLElement[],
  previousCount: number,
  previousFirst: HTMLElement | null,
) {
  if (flushPendingScrollToMessage(state))
    return;

  if (previousCount === 0) {
    if (
      applyDefaultScrollPosition(state)
      || (children.length > 0 && state.autoScroll() && scrollToEnd(state, { behavior: 'auto' }))
    ) {
      return;
    }
    commitScrollState(state);
    return;
  }

  const previousIndex = previousFirst
    ? children.indexOf(previousFirst)
    : -1;
  if (state.preserveScrollOnPrepend && previousIndex > 0) {
    applyPrependRestore(state);
    return;
  }

  if (children.length > previousCount) {
    const anchor = findScrollAnchor(children, { fromIndex: previousCount });
    if (anchor) {
      followOrPinAnchor(state, anchor);
      return;
    }
  }

  if (children.length === previousCount) {
    const anchor = findScrollAnchor(children, { unhandled: state.handledScrollAnchors });
    if (anchor) {
      followOrPinAnchor(state, anchor);
      return;
    }
  }

  if (state.mode === 'following-bottom' && state.autoScroll())
    scrollToEnd(state, { behavior: 'auto' });
  else
    commitScrollState(state);
}

export function handleContentChange(state: EngineState) {
  if (!state.content)
    return;
  const children = getMessageChildren(state.content, state.spacer);
  const previousCount = state.itemCount;
  const previousFirst = state.firstItem;
  state.itemCount = children.length;
  state.firstItem = children[0] ?? null;
  applyContentChange(state, children, previousCount, previousFirst);
  capturePrependAnchor(state);
}

export function handleResize(state: EngineState) {
  if (state.mode === 'following-bottom' && state.autoScroll()) {
    scrollToEnd(state, { behavior: 'auto' });
    return;
  }
  const previousSpacerHeight = state.spacerHeight;
  if (reanchorToAnchoredMessage(state)) {
    if (state.autoScroll() && previousSpacerHeight > 0 && state.spacerHeight === 0)
      scrollToEnd(state, { behavior: 'auto' });
    return;
  }
  scheduleStateCommit(state);
}
