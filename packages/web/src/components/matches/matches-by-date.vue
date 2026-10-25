<script setup lang="ts">
import type { CategoryKey } from '@padel-cantabria/database';
import { groupMatchesByDate } from '@padel-cantabria/shared';
import { computed, toRef } from 'vue';
import TableSkeleton from '@/components/table-skeleton.vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useLeagues } from '@/composables/use-leagues';
import { useMatchResults } from '@/composables/use-match-results';
import { useMatches } from '@/composables/use-matches';
import MatchRow from './match-row.vue';

const props = defineProps<{
  category: CategoryKey;
  teamId?: number;
}>();

const category = toRef(props, 'category');
const teamId = toRef(props, 'teamId');
const isHydrated = useHydrated();
const { data: leagues } = useLeagues();
const { data: matches, isPending, isError } = useMatches(category, teamId);

const matchIds = computed(
  () => matches.value?.map((match) => match.id) ?? [],
);
const { data: resultsById } = useMatchResults(category, matchIds);

const showSkeleton = computed(() => !isHydrated.value || isPending.value);

const season = computed(
  () =>
    leagues.value?.find(
      (league) => league.league_id === props.category.league_id,
    )?.schedule ?? null,
);

const groups = computed(() => {
  if (!matches.value) {
    return [];
  }

  return season.value
    ? groupMatchesByDate(matches.value, season.value)
    : [{ date: 'Partidos', matches: matches.value }];
});

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar los partidos' : null,
);
</script>

<template>
  <TableSkeleton
    v-if="showSkeleton"
    :rows="8"
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
    v-else-if="groups.length === 0"
    class="text-sm text-muted"
  >
    No hay partidos disponibles.
  </p>

  <div
    v-else
    class="flex flex-col gap-8"
  >
    <section
      v-for="group in groups"
      :key="group.date"
      class="flex flex-col gap-4"
    >
      <h2 class="text-lg font-medium text-foreground">
        {{ group.date }}
      </h2>
      <ul class="flex flex-col gap-4">
        <li
          v-for="match in group.matches"
          :key="match.id"
        >
          <MatchRow
            :match="match"
            :result="resultsById?.[String(match.id)] ?? null"
          />
        </li>
      </ul>
    </section>
  </div>
</template>
