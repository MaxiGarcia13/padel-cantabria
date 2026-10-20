import type {
  MessageScrollerContext,
  MessageScrollerProviderProps,
  MessageScrollerScrollable,
  MessageScrollerScrollOptions,
  RegisterMessage,
} from './types';
import { computed, shallowRef } from 'vue';
import {
  AUTOSCROLLING_TIMEOUT,
  DEFAULT_SCROLL_EDGE_THRESHOLD,
  DEFAULT_SCROLL_MARGIN,
  DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK,
  SCROLL_EPSILON,
} from './constants';
import {
  computeScrollable,
  computeScrollTopForElement,
  computeSpacerHeight,
  EMPTY_SCROLLABLE,
  findFirstVisibleMessage,
  findLastAnchor,
  findScrollAnchor,
  getElementOffsetTop,
  getMessageChildren,
  getRelativeTop,
  getRowGap,
  isNear,
  maxScrollTop,
  measureContentHeight,
  scrollableEqual,
} from './dom';

type Mode
  = | 'following-bottom'
    | 'free-scrolling'
    | 'anchored-to-message'
    | 'settling-jump';

interface PrependRestore {
  element: HTMLElement;
  viewportTop: number;
}

interface PendingScrollToMessage {
  messageId: string;
  options?: MessageScrollerScrollOptions;
}

export function createMessageScrollerEngine(props: MessageScrollerProviderProps) {
  const autoScroll = () => props.autoScroll ?? false;
  const defaultScrollPosition = () => props.defaultScrollPosition ?? 'end';
  const scrollEdgeThreshold = () => props.scrollEdgeThreshold ?? DEFAULT_SCROLL_EDGE_THRESHOLD;
  const scrollPreviousItemPeek = () => props.scrollPreviousItemPeek ?? DEFAULT_SCROLL_PREVIOUS_ITEM_PEEK;
  const scrollMargin = () => props.scrollMargin ?? DEFAULT_SCROLL_MARGIN;

  let viewport: HTMLElement | null = null;
  let content: HTMLElement | null = null;
  let spacer: HTMLElement | null = null;
  let spacerGap = 0;
  let spacerHeight = 0;
  let mode: Mode = autoScroll() ? 'following-bottom' : 'free-scrolling';
  let streamingTurn: HTMLElement | null = null;
  let firstItem: HTMLElement | null = null;
  let itemCount = 0;
  let lastScrollTop = 0;
  let defaultScrollPositionApplied = false;
  let preserveScrollOnPrepend = true;
  let prependRestore: PrependRestore | null = null;
  let pendingScrollToMessage: PendingScrollToMessage | null = null;
  let stateFrame: number | null = null;
  let pendingScrollFrame: number | null = null;
  let autoscrollingTimeout: number | null = null;
  const messageElements = new Map<string, HTMLElement>();
  const handledScrollAnchors = new WeakSet<HTMLElement>();

  const autoscrolling = shallowRef(false);
  const scrollable = shallowRef<MessageScrollerScrollable>(EMPTY_SCROLLABLE);
  const scrollableAttr = computed(() => {
    const attr = [scrollable.value.start && 'start', scrollable.value.end && 'end']
      .filter(Boolean)
      .join(' ');
    return attr || undefined;
  });

  function updateModeFromScroll(next: MessageScrollerScrollable) {
    const scrollTop = viewport?.scrollTop ?? 0;
    const scrolledUp = scrollTop < lastScrollTop - SCROLL_EPSILON;
    lastScrollTop = scrollTop;
    if (
      autoScroll()
      && !next.end
      && mode !== 'settling-jump'
      && mode !== 'anchored-to-message'
    ) {
      mode = 'following-bottom';
    } else if (
      mode === 'following-bottom'
      && next.end
      && scrolledUp
      && !autoscrolling.value
    ) {
      mode = 'free-scrolling';
    }
  }

  function commitScrollState() {
    const measured = computeScrollable({
      content,
      scrollEdgeThreshold: scrollEdgeThreshold(),
      spacer,
      viewport,
    });
    updateModeFromScroll(measured);
    const next = mode === 'following-bottom'
      ? { ...measured, end: false }
      : measured;
    if (!scrollableEqual(scrollable.value, next))
      scrollable.value = next;
  }

  function scheduleStateCommit() {
    if (stateFrame !== null)
      return;
    stateFrame = window.requestAnimationFrame(() => {
      stateFrame = null;
      commitScrollState();
    });
  }

  function setAutoscrolling(active: boolean) {
    if (autoscrollingTimeout !== null) {
      window.clearTimeout(autoscrollingTimeout);
      autoscrollingTimeout = null;
    }
    if (autoscrolling.value !== active) {
      autoscrolling.value = active;
      commitScrollState();
    }
    if (!active)
      return;
    autoscrollingTimeout = window.setTimeout(() => {
      autoscrollingTimeout = null;
      autoscrolling.value = false;
      commitScrollState();
    }, AUTOSCROLLING_TIMEOUT);
  }

  function setSpacerHeight(height: number) {
    if (!spacer)
      return;
    const next = Math.max(0, Math.ceil(height));
    if (spacerHeight === next)
      return;
    spacerHeight = next;
    spacer.hidden = next === 0;
    spacer.style.height = `${next}px`;
    spacer.style.marginTop = next > 0 ? `${-spacerGap}px` : '';
  }

  function scrollTo(
    top: number,
    {
      behavior = 'auto',
      autoscrolling: isAutoscrolling = false,
    }: {
      behavior?: ScrollBehavior;
      autoscrolling?: boolean;
    } = {},
  ) {
    if (!viewport)
      return;
    const target = Math.max(0, top);
    if (isNear(viewport.scrollTop, target)) {
      viewport.scrollTop = target;
      commitScrollState();
      return;
    }
    if (isAutoscrolling)
      setAutoscrolling(true);
    viewport.scrollTo({ top: target, behavior });
    scheduleStateCommit();
  }

  function scrollToStart({ behavior = 'auto' }: { behavior?: ScrollBehavior } = {}): boolean {
    if (!viewport)
      return false;
    setSpacerHeight(0);
    streamingTurn = null;
    mode = 'free-scrolling';
    scrollTo(0, { behavior });
    return true;
  }

  function scrollToEnd({ behavior = 'auto' }: { behavior?: ScrollBehavior } = {}): boolean {
    if (!viewport)
      return false;
    setSpacerHeight(0);
    streamingTurn = null;
    mode = autoScroll() ? 'following-bottom' : 'free-scrolling';
    scrollTo(maxScrollTop(viewport), { autoscrolling: true, behavior });
    return true;
  }

  function scrollToElement(
    element: HTMLElement,
    {
      align = 'start',
      behavior = 'auto',
      scrollMargin: margin = scrollMargin(),
    }: MessageScrollerScrollOptions = {},
    { keepPreviousPeek = false }: { keepPreviousPeek?: boolean } = {},
  ): boolean {
    if (!content || !viewport || !content.contains(element))
      return false;
    const targetScrollTop = computeScrollTopForElement({
      align,
      element,
      scrollMargin: keepPreviousPeek ? margin + scrollPreviousItemPeek() : margin,
      spacer,
      viewport,
    });
    setSpacerHeight(computeSpacerHeight({
      content,
      scrollTop: targetScrollTop,
      spacer,
      viewport,
    }));
    prependRestore = { element, viewportTop: getRelativeTop(element, viewport) };
    mode = keepPreviousPeek ? 'anchored-to-message' : 'settling-jump';
    streamingTurn = keepPreviousPeek ? element : null;
    scrollTo(targetScrollTop, { behavior });
    return true;
  }

  function reanchorToAnchoredMessage(): boolean {
    if (!streamingTurn || !streamingTurn.isConnected || mode !== 'anchored-to-message')
      return false;
    return scrollToElement(streamingTurn, { align: 'start' }, { keepPreviousPeek: true });
  }

  function scrollToMessage(
    messageId: string,
    options?: MessageScrollerScrollOptions,
  ): boolean {
    const element = messageElements.get(messageId);
    if (element) {
      defaultScrollPositionApplied = true;
      if (scrollToElement(element, options)) {
        pendingScrollToMessage = null;
        return true;
      }
      pendingScrollToMessage = { messageId, options };
      return true;
    }
    if (itemCount === 0) {
      pendingScrollToMessage = { messageId, options };
      defaultScrollPositionApplied = true;
      return true;
    }
    return false;
  }

  function flushPendingScrollToMessage(): boolean {
    if (!pendingScrollToMessage)
      return false;
    const element = messageElements.get(pendingScrollToMessage.messageId);
    if (!element || !scrollToElement(element, pendingScrollToMessage.options))
      return false;
    pendingScrollToMessage = null;
    defaultScrollPositionApplied = true;
    return true;
  }

  function applyPrependRestore(): boolean {
    if (!prependRestore || !viewport || !prependRestore.element.isConnected)
      return false;
    const delta = getRelativeTop(prependRestore.element, viewport) - prependRestore.viewportTop;
    if (isNear(delta, 0))
      return false;
    viewport.scrollTop += delta;
    prependRestore.viewportTop = getRelativeTop(prependRestore.element, viewport);
    scheduleStateCommit();
    return true;
  }

  function capturePrependAnchor() {
    if (!content || !viewport) {
      prependRestore = null;
      return;
    }
    const element = findFirstVisibleMessage({ content, spacer, viewport });
    prependRestore = element
      ? { element, viewportTop: getRelativeTop(element, viewport) }
      : null;
  }

  function schedulePendingScrollFlush() {
    if (pendingScrollFrame !== null)
      return;
    pendingScrollFrame = window.requestAnimationFrame(() => {
      pendingScrollFrame = null;
      if (flushPendingScrollToMessage())
        capturePrependAnchor();
    });
  }

  function applyDefaultScrollPosition(): boolean {
    if (defaultScrollPositionApplied || itemCount === 0)
      return false;

    const position = defaultScrollPosition();
    let applied = false;

    if (position === 'last-anchor') {
      const lastAnchor = content && viewport
        ? findLastAnchor(getMessageChildren(content, spacer))
        : null;
      if (!content || !viewport || !lastAnchor) {
        applied = scrollToEnd({ behavior: 'auto' });
      } else {
        const anchorOffset = getElementOffsetTop(lastAnchor, viewport);
        const contentHeight = measureContentHeight({ content, spacer, viewport });
        applied = contentHeight - anchorOffset <= viewport.clientHeight
          ? scrollToEnd({ behavior: 'auto' })
          : scrollToElement(lastAnchor, { align: 'start' }, { keepPreviousPeek: true });
      }
    } else {
      applied = position === 'end'
        ? scrollToEnd({ behavior: 'auto' })
        : scrollToStart({ behavior: 'auto' });
    }

    if (!applied)
      return false;
    defaultScrollPositionApplied = true;
    return true;
  }

  function followOrPinAnchor(anchor: HTMLElement) {
    handledScrollAnchors.add(anchor);
    if (autoScroll() && mode === 'following-bottom') {
      scrollToEnd({ behavior: 'auto' });
      return;
    }
    scrollToElement(anchor, { align: 'start' }, { keepPreviousPeek: true });
  }

  function applyContentChange(
    children: HTMLElement[],
    previousCount: number,
    previousFirst: HTMLElement | null,
  ) {
    if (flushPendingScrollToMessage())
      return;

    if (previousCount === 0) {
      if (
        applyDefaultScrollPosition()
        || (children.length > 0 && autoScroll() && scrollToEnd({ behavior: 'auto' }))
      ) {
        return;
      }
      commitScrollState();
      return;
    }

    const previousIndex = previousFirst ? children.indexOf(previousFirst) : -1;
    if (preserveScrollOnPrepend && previousIndex > 0) {
      applyPrependRestore();
      return;
    }

    if (children.length > previousCount) {
      const anchor = findScrollAnchor(children, { fromIndex: previousCount });
      if (anchor) {
        followOrPinAnchor(anchor);
        return;
      }
    }

    if (children.length === previousCount) {
      const anchor = findScrollAnchor(children, { unhandled: handledScrollAnchors });
      if (anchor) {
        followOrPinAnchor(anchor);
        return;
      }
    }

    if (mode === 'following-bottom' && autoScroll())
      scrollToEnd({ behavior: 'auto' });
    else
      commitScrollState();
  }

  function handleContentChange() {
    if (!content)
      return;
    const children = getMessageChildren(content, spacer);
    const previousCount = itemCount;
    const previousFirst = firstItem;
    itemCount = children.length;
    firstItem = children[0] ?? null;
    applyContentChange(children, previousCount, previousFirst);
    capturePrependAnchor();
  }

  function handleResize() {
    if (mode === 'following-bottom' && autoScroll()) {
      scrollToEnd({ behavior: 'auto' });
      return;
    }
    const previousSpacerHeight = spacerHeight;
    if (reanchorToAnchoredMessage()) {
      // Spacer drained by streaming reply → hand off to live edge.
      if (autoScroll() && previousSpacerHeight > 0 && spacerHeight === 0)
        scrollToEnd({ behavior: 'auto' });
      return;
    }
    scheduleStateCommit();
  }

  const registerMessage: RegisterMessage = (messageId, element, previousElement) => {
    if (element) {
      messageElements.set(messageId, element);
      if (pendingScrollToMessage?.messageId === messageId)
        schedulePendingScrollFlush();
      return;
    }
    if (previousElement && messageElements.get(messageId) === previousElement)
      messageElements.delete(messageId);
  };

  function userScrollIntent() {
    if (
      mode === 'following-bottom'
      || mode === 'anchored-to-message'
      || mode === 'settling-jump'
    ) {
      streamingTurn = null;
      mode = 'free-scrolling';
    }
  }

  function setViewportElement(element: HTMLElement | null) {
    viewport = element;
  }

  function setContentElement(element: HTMLElement | null) {
    content = element;
  }

  function setSpacerElement(element: HTMLElement | null) {
    spacer = element;
    spacerGap = getRowGap(element?.parentElement ?? null);
  }

  function setPreserveScrollOnPrepend(value: boolean) {
    preserveScrollOnPrepend = value;
  }

  function syncAfterScroll() {
    commitScrollState();
    capturePrependAnchor();
  }

  function onAutoScrollChange() {
    if (autoScroll() && mode === 'following-bottom' && itemCount > 0) {
      scrollToEnd({ behavior: 'auto' });
      return;
    }
    commitScrollState();
  }

  function destroy() {
    if (stateFrame !== null) {
      window.cancelAnimationFrame(stateFrame);
      stateFrame = null;
    }
    if (autoscrollingTimeout !== null) {
      window.clearTimeout(autoscrollingTimeout);
      autoscrollingTimeout = null;
    }
    if (pendingScrollFrame !== null) {
      window.cancelAnimationFrame(pendingScrollFrame);
      pendingScrollFrame = null;
    }
  }

  const context: MessageScrollerContext = {
    autoscrolling,
    scrollable,
    scrollableAttr,
    handleContentChange,
    handleResize,
    scrollToEnd,
    scrollToMessage,
    scrollToStart,
    setContentElement,
    setSpacerElement,
    setViewportElement,
    setPreserveScrollOnPrepend,
    syncAfterScroll,
    userScrollIntent,
  };

  return {
    context,
    registerMessage,
    applyDefaultScrollPosition,
    onAutoScrollChange,
    destroy,
  };
}
