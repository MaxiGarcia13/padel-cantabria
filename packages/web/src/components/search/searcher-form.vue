<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import { computed, nextTick, ref, watch } from 'vue';
import Button from '@/components/button.vue';
import ChevronDownIcon from '@/components/icons/chevron-down-icon.vue';
import { useLeagues } from '@/composables/use-leagues';
import { useSearchFilters } from '@/composables/use-search-filters';
import { useSearchNavigation } from '@/composables/use-search-navigation';
import CategorySelect from './category-select.vue';
import GenderSelect from './gender-select.vue';
import LeagueSelect from './league-select.vue';
import PhaseSelect from './phase-select.vue';
import SearcherSkeleton from './searcher-skeleton.vue';
import TeamAutocomplete from './team-autocomplete.vue';

const props = defineProps<{
  initialLeagueId?: string;
  initialGenderValue?: string;
  initialPhaseValue?: string;
  initialCategoryValue?: string;
}>();

const emit = defineEmits<{
  navigated: [];
}>();

const { data: leagues, isPending, isError, error } = useLeagues();
const { search, searchTeam } = useSearchNavigation();

const teamQuery = ref('');
const selectedTeam = ref<Team | null>(null);
const hasInitialFilters = Boolean(
  props.initialLeagueId
  && props.initialGenderValue
  && props.initialPhaseValue
  && props.initialCategoryValue,
);
const filtersExpanded = ref(hasInitialFilters);

const {
  leagueId,
  genderValue,
  phaseValue,
  categoryValue,
  genders,
  phases,
  categories,
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

const canSearchTeam = computed(() => selectedTeam.value != null);

watch(teamQuery, (value) => {
  if (selectedTeam.value && value !== selectedTeam.value.name) {
    selectedTeam.value = null;
  }
});

function onTeamSelect(team: Team): void {
  selectedTeam.value = team;
}

function toggleFilters(): void {
  filtersExpanded.value = !filtersExpanded.value;
}

function resetTeamSearch(): void {
  teamQuery.value = '';
  selectedTeam.value = null;
}

async function onSearchTeam(): Promise<void> {
  if (!selectedTeam.value) {
    return;
  }

  const teamId = selectedTeam.value.id;

  resetTeamSearch();
  emit('navigated');
  await nextTick();
  searchTeam(teamId);
}

async function onSearchFilters(): Promise<void> {
  if (!canSearch.value) {
    return;
  }

  const filters = {
    leagueId: leagueId.value,
    genderValue: genderValue.value,
    phaseValue: phaseValue.value,
    categoryValue: categoryValue.value,
  };

  emit('navigated');
  await nextTick();
  search(filters);
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <form
      class="flex flex-col gap-4 sm:flex-row sm:items-center"
      @submit.prevent="onSearchTeam"
    >
      <div class="min-w-0 flex-1">
        <TeamAutocomplete
          v-model="teamQuery"
          @select="onTeamSelect"
        />
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <Button
          type="submit"
          :disabled="!canSearchTeam"
        >
          Buscar
        </Button>

        <Button
          type="button"
          variant="outline"
          size="icon"
          class="text-muted hover:text-foreground"
          :aria-expanded="filtersExpanded"
          aria-label="Mostrar filtros"
          @click="toggleFilters"
        >
          <ChevronDownIcon
            class="size-6 transition-transform"
            :class="{ 'rotate-180': filtersExpanded }"
          />
        </Button>
      </div>
    </form>

    <template v-if="filtersExpanded">
      <p class="text-center text-sm text-muted">
        o
      </p>

      <SearcherSkeleton v-if="isPending" />

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

      <form
        v-else
        class="flex flex-col gap-4 lg:flex-row lg:items-end"
        @submit.prevent="onSearchFilters"
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

        <Button
          type="submit"
          class="w-full lg:w-auto"
          :disabled="!canSearch"
        >
          Buscar
        </Button>
      </form>
    </template>
  </div>
</template>
