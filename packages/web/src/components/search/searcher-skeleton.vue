<script setup lang="ts">
import { Skeleton } from '@/components/ui/skeleton';
</script>

<template>
  <div
    class="flex flex-col gap-4 lg:flex-row lg:items-end"
    role="status"
    aria-label="Cargando ligas"
  >
    <div class="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <div
        v-for="index in 4"
        :key="index"
        class="flex flex-col gap-2"
      >
        <Skeleton class="h-4 w-16" />
        <Skeleton class="h-10 w-full" />
      </div>
    </div>

    <Skeleton class="h-10 w-full lg:w-24" />
  </div>
</template>
