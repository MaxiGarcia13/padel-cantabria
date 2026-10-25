<script setup lang="ts">
import { defineAsyncComponent } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';

defineProps<{
  teamId: number;
}>();

const TeamPlayersTable = defineAsyncComponent(
  () => import('./team-players-table.vue'),
);
</script>

<template>
  <Suspense>
    <TeamPlayersTable :team-id="teamId" />

    <template #fallback>
      <div class="flex flex-col gap-8">
        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-semibold tracking-tight text-foreground">
            Jugadores
          </h2>
          <TableSkeleton
            :rows="8"
            :columns="7"
          />
        </section>

        <section class="flex flex-col gap-4">
          <h2 class="text-lg font-semibold tracking-tight text-foreground">
            Mejores parejas
          </h2>
          <TableSkeleton
            :rows="5"
            :columns="5"
          />
        </section>
      </div>
    </template>
  </Suspense>
</template>
