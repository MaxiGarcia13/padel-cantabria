<script setup lang="ts">
import { useTemplateRef } from 'vue';
import Button from '@/components/button.vue';
import XIcon from '@/components/icons/x-icon.vue';
import { useClickOutside } from '@/composables/use-click-outside';

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

useClickOutside(dialogRef, close);

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
    class="m-auto box-border max-h-[90dvh] w-[calc(100%-2rem)] max-w-3xl overflow-y-auto rounded-xl border border-border bg-surface p-6 text-foreground shadow-lg backdrop:bg-background/80 backdrop:backdrop-blur-sm"
  >
    <header class="mb-4 flex items-start justify-between gap-4">
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
