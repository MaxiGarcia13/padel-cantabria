<script setup lang="ts">
import { computed, toRef } from 'vue';
import { useLeagues } from '@/composables/use-leagues';
import { useSearchCollapse } from '@/composables/use-search-collapse';
import { useSearchFilters } from '@/composables/use-search-filters';
import { useSearchNavigation } from '@/composables/use-search-navigation';
import CategorySelect from './category-select.vue';
import GenderSelect from './gender-select.vue';
import LeagueSelect from './league-select.vue';
import PhaseSelect from './phase-select.vue';
import SearchSummaryToggle from './search-summary-toggle.vue';

const props = defineProps<{
  initialLeagueId?: string;
  initialGenderValue?: string;
  initialPhaseValue?: string;
  initialCategoryValue?: string;
  collapsible?: boolean;
}>();

const { data: leagues, isPending, isError, error } = useLeagues();
const { search } = useSearchNavigation();
const { isCollapsible, isExpanded, toggleExpanded } = useSearchCollapse(
  toRef(props, 'collapsible'),
);

const {
  leagueId,
  genderValue,
  phaseValue,
  categoryValue,
  genders,
  phases,
  categories,
  locationSummary,
  canSearch,
  onLeagueChange,
  onGenderChange,
  onPhaseChange,
} = useSearchFilters(leagues, {
  leagueId: props.initialLeagueId,
  genderValue: props.initialGenderValue,
  phaseValue: props.initialPhaseValue,
  categoryValue: props.initialCategoryValue,
});

const errorMessage = computed(() => {
  if (!isError.value) {
    return null;
  }

  return error.value instanceof Error
    ? error.value.message
    : 'Error inesperado';
});

const showFilters = computed(() => !isCollapsible.value || isExpanded.value);

function onSearch(): void {
  if (!canSearch.value) {
    return;
  }

  search({
    leagueId: leagueId.value,
    genderValue: genderValue.value,
    phaseValue: phaseValue.value,
    categoryValue: categoryValue.value,
  });
}
</script>

<template>
  <p
    v-if="isPending"
    class="text-sm text-muted"
  >
    Cargando ligas…
  </p>

  <p
    v-else-if="errorMessage"
    class="text-sm text-danger"
    role="alert"
  >
    {{ errorMessage }}
  </p>

  <p
    v-else-if="!leagues?.length"
    class="text-sm text-muted"
  >
    No hay ligas disponibles.
  </p>

  <div
    v-else
    class="flex flex-col gap-4"
  >
    <SearchSummaryToggle
      v-if="isCollapsible && locationSummary"
      :summary="locationSummary"
      :expanded="isExpanded"
      @toggle="toggleExpanded"
    />

    <form
      v-show="showFilters"
      class="flex flex-col gap-4 lg:flex-row lg:items-end"
      @submit.prevent="onSearch"
    >
      <div class="grid min-w-0 flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <LeagueSelect
          :model-value="leagueId"
          :leagues="leagues"
          @update:model-value="onLeagueChange"
        />

        <GenderSelect
          :model-value="genderValue"
          :genders="genders"
          :disabled="!leagueId"
          @update:model-value="onGenderChange"
        />

        <PhaseSelect
          :model-value="phaseValue"
          :phases="phases"
          :disabled="!genderValue"
          @update:model-value="onPhaseChange"
        />

        <CategorySelect
          v-model="categoryValue"
          :categories="categories"
          :disabled="!phaseValue"
        />
      </div>

      <button
        type="submit"
        class="w-full shrink-0 rounded-xl bg-primary px-6 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
        :disabled="!canSearch"
      >
        Buscar
      </button>
    </form>
  </div>
</template>
