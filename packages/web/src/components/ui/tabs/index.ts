import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as TabsContent } from './tabs-content.vue';
export { default as TabsList } from './tabs-list.vue';
export { default as TabsTrigger } from './tabs-trigger.vue';
export { default as Tabs } from './tabs.vue';

export const tabsListVariants = cva(
  'group/tabs-list inline-flex w-full items-center justify-center rounded-xl border border-border p-2 text-muted group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col',
  {
    variants: {
      variant: {
        default: 'bg-surface',
        line: 'gap-2 border-0 bg-transparent p-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type TabsListVariants = VariantProps<typeof tabsListVariants>;
