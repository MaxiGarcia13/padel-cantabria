<script setup lang="ts">
import Skeleton from '@/components/skeleton.vue';
</script>

<template>
  <section
    class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4"
    role="status"
    aria-label="Cargando"
  >
    <Skeleton class="h-4 w-32" />

    <div class="flex flex-col gap-2">
      <Skeleton class="h-5 w-full max-w-sm" />
      <Skeleton class="h-4 w-40" />
    </div>

    <Skeleton class="h-4 w-28" />
  </section>
</template>
