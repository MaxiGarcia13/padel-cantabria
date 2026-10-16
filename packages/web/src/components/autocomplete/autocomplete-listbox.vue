<script setup lang="ts">
defineProps<{
  id?: string;
}>();
</script>

<template>
  <ul
    :id="id"
    role="listbox"
    class="max-h-60 w-full overflow-auto rounded-xl border border-border bg-surface py-2"
  >
    <slot />
  </ul>
</template>
