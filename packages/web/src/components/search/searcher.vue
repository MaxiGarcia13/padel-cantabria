<script setup lang="ts">
import type { Gender, Phase, SelectOption } from '@padel-cantabria/database';
import { navigate } from 'astro:transitions/client';
import { computed, ref } from 'vue';
import { useLeagues } from '@/composables/use-leagues';
import CategorySelect from './category-select.vue';
import GenderSelect from './gender-select.vue';
import LeagueSelect from './league-select.vue';
import PhaseSelect from './phase-select.vue';

const EMPTY_GENDERS: Gender[] = [];
const EMPTY_PHASES: Phase[] = [];
const EMPTY_CATEGORIES: SelectOption[] = [];

const { data: leagues, isPending, isError, error } = useLeagues();

const selectedLeagueId = ref('');
const selectedGenderValue = ref('');
const selectedPhaseValue = ref('');
const selectedCategoryValue = ref('');

const selectedLeague = computed(() =>
  leagues.value?.find(
    (league) => String(league.league_id) === selectedLeagueId.value,
  ),
);

const selectedGender = computed(() =>
  selectedLeague.value?.genders.find(
    (gender) => gender.value === selectedGenderValue.value,
  ),
);

const selectedPhase = computed(() =>
  selectedGender.value?.phases.find(
    (phase) => phase.value === selectedPhaseValue.value,
  ),
);

const genders = computed(
  () => selectedLeague.value?.genders ?? EMPTY_GENDERS,
);

const phases = computed(() => selectedGender.value?.phases ?? EMPTY_PHASES);

const categories = computed(
  () => selectedPhase.value?.categories ?? EMPTY_CATEGORIES,
);

const errorMessage = computed(() => {
  if (!isError.value) {
    return null;
  }

  return error.value instanceof Error
    ? error.value.message
    : 'Error inesperado';
});

const canSearch = computed(
  () =>
    Boolean(
      selectedLeagueId.value
      && selectedGenderValue.value
      && selectedPhaseValue.value
      && selectedCategoryValue.value,
    ),
);

function search(): void {
  if (!canSearch.value) {
    return;
  }

  const path = [
    selectedLeagueId.value,
    selectedGenderValue.value,
    selectedPhaseValue.value,
    selectedCategoryValue.value,
  ]
    .map((segment) => encodeURIComponent(segment))
    .join('/');

  void navigate(`/${path}`);
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

  <form
    v-else
    class="flex flex-col gap-4 lg:flex-row lg:items-end"
    @submit.prevent="search"
  >
    <div class="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <LeagueSelect
        v-model="selectedLeagueId"
        :leagues="leagues"
      />

      <GenderSelect
        v-model="selectedGenderValue"
        :genders="genders"
        :disabled="!selectedLeagueId"
      />

      <PhaseSelect
        v-model="selectedPhaseValue"
        :phases="phases"
        :disabled="!selectedGenderValue"
      />

      <CategorySelect
        v-model="selectedCategoryValue"
        :categories="categories"
        :disabled="!selectedPhaseValue"
      />
    </div>

    <button
      type="submit"
      class="rounded-xl bg-primary px-6 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canSearch"
    >
      Buscar
    </button>
  </form>
</template>
