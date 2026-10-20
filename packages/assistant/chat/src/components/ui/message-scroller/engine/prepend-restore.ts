import type { EngineState } from './engine-state';
import { findFirstVisibleMessage } from '../dom/anchors';
import { getRelativeTop } from '../dom/measure';
import { isNear } from '../dom/scrollable';
import { scheduleStateCommit } from './mode-and-scroll-state';
import { flushPendingScrollToMessage } from './scroll-actions';

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
    ? { element, viewportTop: getRelativeTop(element, state.viewport) }
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
