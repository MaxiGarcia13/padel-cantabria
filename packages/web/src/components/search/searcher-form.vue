<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import { computed, ref, watch } from 'vue';
import Button from '@/components/button.vue';
import ChevronDownIcon from '@/components/icons/chevron-down-icon.vue';
import LoaderIcon from '@/components/icons/loader-icon.vue';
import XIcon from '@/components/icons/x-icon.vue';
import { useHydrated } from '@/composables/use-hydrated';
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
  closable?: boolean;
}>();

const emit = defineEmits<{
  close: [];
}>();

const { data: leagues, isPending, isError } = useLeagues();
const { search, searchTeam } = useSearchNavigation();

const teamQuery = ref('');
const selectedTeam = ref<Team | null>(null);
const isNavigating = ref(false);
const isHydrated = useHydrated();
const hasInitialFilters = Boolean(
  props.initialLeagueId
  && props.initialGenderValue
  && props.initialPhaseValue
  && props.initialCategoryValue,
);
const filtersExpanded = ref(hasInitialFilters);

const showFiltersSkeleton = computed(
  () => !isHydrated.value || isPending.value,
);

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

const errorMessage = computed(() =>
  isError.value ? 'No se pudieron cargar las ligas' : null,
);

watch(teamQuery, (value) => {
  if (selectedTeam.value && value !== selectedTeam.value.name) {
    selectedTeam.value = null;
  }
});

function onTeamSelect(team: Team): void {
  selectedTeam.value = team;

  onSearchTeam();
}

function toggleFilters(): void {
  if (isNavigating.value) {
    return;
  }

  filtersExpanded.value = !filtersExpanded.value;
}

function onSearchTeam(): void {
  if (!selectedTeam.value || isNavigating.value) {
    return;
  }

  isNavigating.value = true;
  searchTeam(selectedTeam.value.id);
}

function onSearchFilters(): void {
  if (!canSearch.value || isNavigating.value) {
    return;
  }

  isNavigating.value = true;
  search({
    leagueId: leagueId.value,
    genderValue: genderValue.value,
    phaseValue: phaseValue.value,
    categoryValue: categoryValue.value,
  });
}
</script>

<template>
  <div class="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4">
    <div class="flex flex-row items-center gap-2">
      <div class="min-w-0 flex-1">
        <TeamAutocomplete
          v-model="teamQuery"
          :loading="isNavigating"
          @select="onTeamSelect"
        />
      </div>

      <div class="flex shrink-0 items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="icon"
          class="text-muted hover:text-foreground"
          :disabled="isNavigating"
          :aria-expanded="filtersExpanded"
          aria-label="Mostrar filtros"
          @click="toggleFilters"
        >
          <ChevronDownIcon
            class="size-6 transition-transform"
            :class="{ 'rotate-180': filtersExpanded }"
          />
        </Button>

        <Button
          v-if="closable"
          type="button"
          variant="outline"
          size="icon"
          class="text-muted hover:text-foreground"
          :disabled="isNavigating"
          aria-label="Cerrar"
          @click="emit('close')"
        >
          <XIcon class="size-5" />
        </Button>
      </div>
    </div>

    <template v-if="filtersExpanded">
      <p class="text-center text-sm text-muted">
        o
      </p>

      <SearcherSkeleton v-if="showFiltersSkeleton" />

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
            :disabled="isNavigating"
            @update:model-value="onLeagueChange"
          />

          <GenderSelect
            :model-value="genderValue"
            :genders="genders"
            :disabled="!leagueId || isNavigating"
            @update:model-value="onGenderChange"
          />

          <PhaseSelect
            :model-value="phaseValue"
            :phases="phases"
            :disabled="!genderValue || isNavigating"
            @update:model-value="onPhaseChange"
          />

          <CategorySelect
            v-model="categoryValue"
            :categories="categories"
            :disabled="!phaseValue || isNavigating"
          />
        </div>

        <Button
          type="submit"
          class="w-full gap-2 lg:w-auto"
          :disabled="!canSearch || isNavigating"
        >
          <LoaderIcon
            v-if="isNavigating"
            class="size-5 animate-spin"
          />
          Buscar
        </Button>
      </form>
    </template>
  </div>
</template>
