<script setup lang="ts">
import { useTemplateRef } from 'vue';
import XIcon from '@/components/icons/x-icon.vue';
import { Button } from '@/components/ui/button';
import { useClickOutside } from '@/composables/use-click-outside';

const props = withDefaults(
  defineProps<{
    variant?: 'default' | 'plain';
  }>(),
  {
    variant: 'default',
  },
);

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

useClickOutside(dialogRef, close);

const isPlain = props.variant === 'plain';

const dialogClassName = [
  'm-auto box-border max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl text-foreground backdrop:bg-background/80 backdrop:backdrop-blur-sm',
  isPlain
    ? 'overflow-visible border-0 bg-transparent p-0 shadow-none'
    : 'overflow-y-auto rounded-xl border border-border bg-surface p-6 shadow-lg',
].join(' ');

function showModal() {
  dialogRef.value?.showModal();
}

function close() {
  dialogRef.value?.close();
}

defineExpose({
  showModal,
  close,
});
</script>

<template>
  <dialog
    ref="dialog"
    :class="dialogClassName"
  >
    <header
      v-if="!isPlain"
      class="mb-4 flex items-start justify-between gap-4"
    >
      <div
        v-if="$slots.header"
        class="min-w-0 flex-1 text-lg font-medium"
      >
        <slot name="header" />
      </div>
      <span
        v-else
        class="min-w-0 flex-1"
      />

      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        aria-label="Cerrar"
        @click="close"
      >
        <XIcon class="size-5" />
      </Button>
    </header>

    <slot />

    <footer
      v-if="$slots.footer"
      class="mt-6 flex justify-end gap-2"
    >
      <slot name="footer" />
    </footer>
  </dialog>
</template>
