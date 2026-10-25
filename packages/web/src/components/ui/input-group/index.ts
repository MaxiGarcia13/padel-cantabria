import type { VariantProps } from 'class-variance-authority';
import type { HTMLAttributes } from 'vue';
import type { ButtonVariants } from '@/components/ui/button';
import { cva } from 'class-variance-authority';

export { default as InputGroupAddon } from './input-group-addon.vue';
export { default as InputGroupButton } from './input-group-button.vue';
export { default as InputGroupInput } from './input-group-input.vue';
export { default as InputGroupText } from './input-group-text.vue';
export { default as InputGroupTextarea } from './input-group-textarea.vue';
export { default as InputGroup } from './input-group.vue';

export const inputGroupAddonVariants = cva(
  'flex h-auto cursor-text items-center justify-center gap-2 py-2 text-sm font-medium text-muted select-none group-data-[disabled=true]/input-group:opacity-50 [&>svg:not([class*=size-])]:size-4',
  {
    variants: {
      align: {
        'inline-start': 'order-first pl-2 has-[>button]:ml-[-0.3rem]',
        'inline-end': 'order-last pr-2 has-[>button]:mr-[-0.3rem]',
        'block-start': 'order-first w-full justify-start px-2 pt-2',
        'block-end': 'order-last w-full justify-start px-2 pb-2',
      },
    },
    defaultVariants: {
      align: 'inline-start',
    },
  },
);

export type InputGroupVariants = VariantProps<typeof inputGroupAddonVariants>;

export const inputGroupButtonVariants = cva(
  'flex items-center gap-2 text-sm shadow-none',
  {
    variants: {
      size: {
        'xs': 'h-6 gap-2 rounded-xl px-2 [&>svg:not([class*=size-])]:size-4',
        'sm': '',
        'icon-xs': 'size-6 rounded-xl p-0 has-[>svg]:p-0',
        'icon-sm': 'size-8 p-0 has-[>svg]:p-0',
      },
    },
    defaultVariants: {
      size: 'xs',
    },
  },
);

export type InputGroupButtonVariants = VariantProps<
  typeof inputGroupButtonVariants
>;

export interface InputGroupButtonProps {
  variant?: ButtonVariants['variant'];
  size?: InputGroupButtonVariants['size'];
  class?: HTMLAttributes['class'];
}
