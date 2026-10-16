<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import { computed, toRef } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';
import { useLeagues } from '@/composables/use-leagues';
import { useMatches } from '@/composables/use-matches';
import { getClosestMatches } from '@/domain/matches';
import MatchRow from './match-row.vue';

const props = defineProps<{
  category: CategoryKey;
  calendarHref: string;
}>();

const category = toRef(props, 'category');
const { data: leagues } = useLeagues();
const { data: matches, isPending, isError } = useMatches(category);

const season = computed(
  () =>
    leagues.value?.find(
      (league) => league.league_id === props.category.league_id,
    )?.schedule ?? null,
);

const closestMatches = computed(() => {
  if (!matches.value) {
    return [];
  }

  return season.value
    ? getClosestMatches(matches.value, season.value)
    : matches.value.slice(0, 5);
});

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar los partidos' : null,
);
</script>

<template>
  <div class="flex flex-col gap-4">
    <TableSkeleton
      v-if="isPending"
      :rows="5"
      :columns="3"
    />

    <p
      v-else-if="errorMessage"
      class="text-sm text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-else-if="closestMatches.length === 0"
      class="text-sm text-muted"
    >
      No hay partidos disponibles.
    </p>

    <ul
      v-else
      class="flex flex-col gap-4"
    >
      <li
        v-for="match in closestMatches"
        :key="match.id"
      >
        <MatchRow :match="match" />
      </li>
    </ul>

    <a
      :href="calendarHref"
      class="text-sm font-medium text-primary hover:underline"
    >
      Ver calendario
    </a>
  </div>
</template>
