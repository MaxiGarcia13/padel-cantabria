import type { EngineState } from './engine-state';
import {
  findLastAnchor,
  findScrollAnchor,
} from '../dom/anchors';
import {
  getElementOffsetTop,
  getMessageChildren,
  measureContentHeight,
} from '../dom/measure';
import { commitScrollState, scheduleStateCommit } from './mode-and-scroll-state';
import {
  applyPrependRestore,
  capturePrependAnchor,
} from './prepend-restore';
import {
  flushPendingScrollToMessage,
  reanchorToAnchoredMessage,
  scrollToElement,
  scrollToEnd,
  scrollToStart,
} from './scroll-actions';

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

  const previousIndex = previousFirst ? children.indexOf(previousFirst) : -1;
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
    // Spacer drained by streaming reply → hand off to live edge.
    if (state.autoScroll() && previousSpacerHeight > 0 && state.spacerHeight === 0)
      scrollToEnd(state, { behavior: 'auto' });
    return;
  }
  scheduleStateCommit(state);
}
