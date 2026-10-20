<script setup lang="ts">
import type { TeamDisplayLabels } from '@padel-cantabria/shared';
import TotalPoints from '@/components/total-points.vue';

defineProps<{
  teamName: string;
  totalPoints: number | null;
  displayLabels: TeamDisplayLabels;
}>();
</script>

<template>
  <header class="flex flex-col gap-4">
    <div class="flex items-center justify-between gap-4 sm:items-start">
      <h1 class="text-2xl font-semibold tracking-tight text-foreground">
        {{ teamName }}
      </h1>
      <TotalPoints :points="totalPoints" />
    </div>

    <dl class="flex flex-wrap gap-x-6 gap-y-2 text-sm">
      <div class="flex gap-2">
        <dt class="text-muted">
          Categoría
        </dt>
        <dd class="font-medium text-foreground">
          {{ displayLabels.categoryLabel }}
        </dd>
      </div>
      <div class="flex gap-2">
        <dt class="text-muted">
          Género
        </dt>
        <dd class="font-medium text-foreground">
          {{ displayLabels.genderLabel }}
        </dd>
      </div>
    </dl>
  </header>
</template>
