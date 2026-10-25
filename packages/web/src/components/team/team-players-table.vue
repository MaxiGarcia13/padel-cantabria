<script setup lang="ts">
import { computed, toRef } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';
import { Table, TableBody } from '@/components/ui/table';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeamPlayers } from '@/composables/use-team-players';
import TeamPlayersTableHeader from './team-players-table-header.vue';
import TeamPlayersTableRow from './team-players-table-row.vue';

const props = defineProps<{
  teamId: number;
}>();

const teamId = toRef(props, 'teamId');
const isHydrated = useHydrated();
const { data: players, isPending, isError } = useTeamPlayers(teamId);

const showSkeleton = computed(() => !isHydrated.value || isPending.value);

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar los jugadores' : null,
);
</script>

<template>
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

    <Table v-else>
      <TeamPlayersTableHeader />
      <TableBody>
        <TeamPlayersTableRow
          v-for="player in players"
          :key="`${player.surname}-${player.name}`"
          :player="player"
        />
      </TableBody>
    </Table>
  </section>
</template>
