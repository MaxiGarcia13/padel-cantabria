<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import { computed, toRef } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';
import { Table, TableBody } from '@/components/ui/table';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPlayers } from '@/composables/use-team-players';
import TeamCouplesTable from './team-couples-table.vue';
import TeamPlayersTableHeader from './team-players-table-header.vue';
import TeamPlayersTableRow from './team-players-table-row.vue';

const props = defineProps<{
  teamId: number;
  category: CategoryKey;
}>();

const teamId = toRef(props, 'teamId');
const isHydrated = useHydrated();
const { data, isPending, isError } = useTeamPlayers(teamId);

const players = computed(() => data.value?.players ?? null);
const couples = computed(() => data.value?.couples ?? []);

const showSkeleton = computed(() => !isHydrated.value || isPending.value);

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar los jugadores' : null,
);
</script>

<template>
  <div class="flex flex-col gap-8">
    <section class="flex flex-col gap-4">
      <h2 class="text-lg font-semibold tracking-tight text-foreground">
        Jugadores
      </h2>

      <TableSkeleton
        v-if="showSkeleton"
        :rows="8"
        :columns="7"
      />

      <p
        v-else-if="errorMessage"
        class="text-sm text-danger"
        role="alert"
      >
        {{ errorMessage }}
      </p>

      <p
        v-else-if="!players || players.length === 0"
        class="text-sm text-muted"
      >
        No hay jugadores disponibles.
      </p>

      <Table
        v-else
        class="min-w-max"
      >
        <TeamPlayersTableHeader />
        <TableBody>
          <TeamPlayersTableRow
            v-for="player in players"
            :key="`${player.surname}-${player.name}`"
            :player="player"
            :category="category"
          />
        </TableBody>
      </Table>
    </section>

    <section
      v-if="showSkeleton"
      class="flex flex-col gap-4"
    >
      <h2 class="text-lg font-semibold tracking-tight text-foreground">
        Mejores parejas
      </h2>
      <TableSkeleton
        :rows="5"
        :columns="5"
      />
    </section>

    <TeamCouplesTable
      v-else-if="!errorMessage"
      :couples="couples"
      :team-id="teamId"
      :category="category"
    />
  </div>
</template>
