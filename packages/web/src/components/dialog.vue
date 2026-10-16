<script setup lang="ts">
import { useTemplateRef } from 'vue';

const dialogRef = useTemplateRef<HTMLDialogElement>('dialog');

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
    class="box-border m-auto max-h-[90dvh] w-[calc(100%-2rem)] max-w-sm overflow-y-auto rounded-xl border border-cast-mist/20 bg-cast-panel p-6 text-cast-fog shadow-lg backdrop:bg-cast-ink/80 backdrop:backdrop-blur-sm"
  >
    <header
      v-if="$slots.header"
      class="mb-4 text-lg font-medium"
    >
      <slot name="header" />
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
