<script setup lang="ts">
import type { TeamCoupleStats } from '@padel-cantabria/shared';
import { computed, ref } from 'vue';
import { Button } from '@/components/ui/button';
import { Table, TableBody } from '@/components/ui/table';
import TeamCouplesTableHeader from './team-couples-table-header.vue';
import TeamCouplesTableRow from './team-couples-table-row.vue';

const props = defineProps<{
  couples: TeamCoupleStats[];
  teamId: number;
}>();

const INITIAL_VISIBLE_COUNT = 5;

const showAll = ref(false);

const visibleCouples = computed(() =>
  showAll.value
    ? props.couples
    : props.couples.slice(0, INITIAL_VISIBLE_COUNT),
);

function toggleShowAll() {
  showAll.value = !showAll.value;
}
</script>

<template>
  <section class="flex flex-col gap-4">
    <h2 class="text-lg font-semibold tracking-tight text-foreground">
      Mejores parejas
    </h2>

    <p
      v-if="couples.length === 0"
      class="text-sm text-muted"
    >
      No hay parejas disponibles.
    </p>

    <template v-else>
      <Table class="min-w-max">
        <TeamCouplesTableHeader />
        <TableBody>
          <TeamCouplesTableRow
            v-for="couple in visibleCouples"
            :key="`${couple.player_1.surname}-${couple.player_1.name}-${couple.player_2.surname}-${couple.player_2.name}`"
            :couple="couple"
            :team-id="teamId"
          />
        </TableBody>
      </Table>

      <div
        v-if="couples.length > INITIAL_VISIBLE_COUNT"
        class="flex justify-center"
      >
        <Button
          variant="outline"
          size="sm"
          type="button"
          @click="toggleShowAll"
        >
          {{ showAll ? 'Mostrar menos' : 'Ver todas' }}
        </Button>
      </div>
    </template>
  </section>
</template>
