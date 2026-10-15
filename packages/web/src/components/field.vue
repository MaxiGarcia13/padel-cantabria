<script setup lang="ts">
defineProps<{
  id: string;
  label: string;
}>();
</script>

<template>
  <label
    class="flex flex-col gap-2 text-sm text-zinc-400"
    :for="id"
  >
    {{ label }}
    <slot />
  </label>
</template>
