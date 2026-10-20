import type { InjectionKey } from 'vue';
import type { MessageScrollerContext, MessageScrollerProviderProps, RegisterMessage } from './types';
import { inject, onMounted, onScopeDispose, provide, watch } from 'vue';
import { createMessageScrollerEngine } from './engine/create-message-scroller-engine';

const CONTEXT_KEY: InjectionKey<MessageScrollerContext> = Symbol('MessageScrollerContext');
const REGISTER_KEY: InjectionKey<RegisterMessage> = Symbol('MessageScrollerRegister');

export function provideMessageScroller(props: MessageScrollerProviderProps) {
  const engine = createMessageScrollerEngine(props);
  provide(CONTEXT_KEY, engine.context);
  provide(REGISTER_KEY, engine.registerMessage);

  watch(() => props.autoScroll ?? false, () => engine.onAutoScrollChange());

  onMounted(() => {
    engine.applyDefaultScrollPosition();
    // Viewport mounts after content's first handleContentChange; re-sync once wired.
    engine.context.syncAfterScroll();
  });

  onScopeDispose(() => engine.destroy());

  return engine;
}

export function useMessageScrollerContext(): MessageScrollerContext {
  const context = inject(CONTEXT_KEY, null);
  if (!context)
    throw new Error('useMessageScroller must be used within a MessageScroller.');
  return context;
}

export function useMessageScrollerRegister(): RegisterMessage {
  const register = inject(REGISTER_KEY, null);
  if (!register)
    throw new Error('MessageScrollerItem must be used within a MessageScroller.');
  return register;
}
