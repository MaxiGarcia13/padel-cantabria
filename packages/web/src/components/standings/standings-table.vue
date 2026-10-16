<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import { computed, toRef } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';
import Table from '@/components/table/table.vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useTeams } from '@/composables/use-teams';
import StandingsTableHeader from './standings-table-header.vue';
import StandingsTableRow from './standings-table-row.vue';

const props = defineProps<{
  category: CategoryKey;
}>();

const category = toRef(props, 'category');
const isHydrated = useHydrated();
const { data: teams, isPending, isError } = useTeams(category);

const showSkeleton = computed(() => !isHydrated.value || isPending.value);

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar los equipos' : null,
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <TableSkeleton
      v-if="showSkeleton"
      :rows="8"
      :columns="6"
    />

    <p
      v-else-if="errorMessage"
      class="text-sm text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-else-if="!teams || teams.length === 0"
      class="text-sm text-muted"
    >
      No hay clasificación disponible.
    </p>

    <Table v-else>
      <template #header>
        <StandingsTableHeader />
      </template>
      <StandingsTableRow
        v-for="team in teams"
        :key="team.id"
        :team="team"
      />
    </Table>
  </div>
</template>
