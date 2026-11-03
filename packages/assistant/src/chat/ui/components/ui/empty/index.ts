import type { VariantProps } from 'class-variance-authority';
import { cva } from 'class-variance-authority';

export { default as EmptyContent } from './empty-content.vue';
export { default as EmptyDescription } from './empty-description.vue';
export { default as EmptyHeader } from './empty-header.vue';
export { default as EmptyMedia } from './empty-media.vue';
export { default as EmptyTitle } from './empty-title.vue';
export { default as Empty } from './empty.vue';

export const emptyMediaVariants = cva(
  'mb-2 flex shrink-0 items-center justify-center [&_svg]:pointer-events-none [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        default: 'bg-transparent',
        icon: 'flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted text-foreground [&_svg:not([class*=size-])]:size-4',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
);

export type EmptyMediaVariants = VariantProps<typeof emptyMediaVariants>;
