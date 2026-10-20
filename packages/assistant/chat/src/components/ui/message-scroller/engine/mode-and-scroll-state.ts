import type { MessageScrollerScrollable } from '../types';
import type { EngineState } from './engine-state';
import { AUTOSCROLLING_TIMEOUT, SCROLL_EPSILON } from '../constants';
import { computeScrollable, scrollableEqual } from '../dom/scrollable';

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
