import type {
  MessageScrollerContext,
  MessageScrollerProviderProps,
  RegisterMessage,
} from '../types';
import {
  applyDefaultScrollPosition,
  handleContentChange,
  handleResize,
} from './content-change';
import { createEngineState } from './engine-state';
import { commitScrollState } from './mode-and-scroll-state';
import { capturePrependAnchor, schedulePendingScrollFlush } from './prepend-restore';
import {
  scrollToEnd,
  scrollToMessage,
  scrollToStart,
  setSpacerElement,
} from './scroll-actions';

export function createMessageScrollerEngine(props: MessageScrollerProviderProps) {
  const state = createEngineState(props);

  const registerMessage: RegisterMessage = (messageId, element, previousElement) => {
    if (element) {
      state.messageElements.set(messageId, element);
      if (state.pendingScrollToMessage?.messageId === messageId)
        schedulePendingScrollFlush(state);
      return;
    }
    if (previousElement && state.messageElements.get(messageId) === previousElement)
      state.messageElements.delete(messageId);
  };

  function userScrollIntent() {
    if (
      state.mode === 'following-bottom'
      || state.mode === 'anchored-to-message'
      || state.mode === 'settling-jump'
    ) {
      state.streamingTurn = null;
      state.mode = 'free-scrolling';
    }
  }

  function syncAfterScroll() {
    commitScrollState(state);
    capturePrependAnchor(state);
  }

  function onAutoScrollChange() {
    if (state.autoScroll() && state.mode === 'following-bottom' && state.itemCount > 0) {
      scrollToEnd(state, { behavior: 'auto' });
      return;
    }
    commitScrollState(state);
  }

  function destroy() {
    if (state.stateFrame !== null) {
      window.cancelAnimationFrame(state.stateFrame);
      state.stateFrame = null;
    }
    if (state.autoscrollingTimeout !== null) {
      window.clearTimeout(state.autoscrollingTimeout);
      state.autoscrollingTimeout = null;
    }
    if (state.pendingScrollFrame !== null) {
      window.cancelAnimationFrame(state.pendingScrollFrame);
      state.pendingScrollFrame = null;
    }
  }

  const context: MessageScrollerContext = {
    autoscrolling: state.autoscrolling,
    scrollable: state.scrollable,
    scrollableAttr: state.scrollableAttr,
    handleContentChange: () => handleContentChange(state),
    handleResize: () => handleResize(state),
    scrollToEnd: (options) => scrollToEnd(state, options),
    scrollToMessage: (messageId, options) => scrollToMessage(state, messageId, options),
    scrollToStart: (options) => scrollToStart(state, options),
    setContentElement: (element) => {
      state.content = element;
    },
    setSpacerElement: (element) => setSpacerElement(state, element),
    setViewportElement: (element) => {
      state.viewport = element;
    },
    setPreserveScrollOnPrepend: (value) => {
      state.preserveScrollOnPrepend = value;
    },
    syncAfterScroll,
    userScrollIntent,
  };

  return {
    context,
    registerMessage,
    applyDefaultScrollPosition: () => applyDefaultScrollPosition(state),
    onAutoScrollChange,
    destroy,
  };
}
