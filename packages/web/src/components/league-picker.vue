<script setup lang="ts">
import type {
  Gender,
  Phase,
  SelectOption,
} from '@padel-cantabria/database';
import { navigate } from 'astro:transitions/client';
import { computed, ref, watch } from 'vue';
import { useLeagues } from '../composables/use-leagues';
import Select from './select.vue';

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

const genderOptions = computed<SelectOption[]>(
  () => selectedLeague.value?.genders ?? [],
);

const selectedGender = computed<Gender | undefined>(() =>
  selectedLeague.value?.genders.find(
    (gender) => gender.value === selectedGenderValue.value,
  ),
);

const phaseOptions = computed<SelectOption[]>(
  () => selectedGender.value?.phases ?? [],
);

const selectedPhase = computed<Phase | undefined>(() =>
  selectedGender.value?.phases.find(
    (phase) => phase.value === selectedPhaseValue.value,
  ),
);

const categoryOptions = computed<SelectOption[]>(
  () => selectedPhase.value?.categories ?? [],
);

const leagueOptions = computed<SelectOption[]>(() =>
  (leagues.value ?? []).map((league) => ({
    value: String(league.league_id),
    label: league.name,
  })),
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

watch(
  leagues,
  (nextLeagues) => {
    const firstLeague = nextLeagues?.[0];

    if (!firstLeague || selectedLeagueId.value) {
      return;
    }

    selectedLeagueId.value = String(firstLeague.league_id);
  },
  { immediate: true },
);

watch(selectedLeagueId, () => {
  selectedGenderValue.value = '';
  selectedPhaseValue.value = '';
  selectedCategoryValue.value = '';
});

watch(selectedGenderValue, () => {
  selectedPhaseValue.value = '';
  selectedCategoryValue.value = '';
});

watch(selectedPhaseValue, () => {
  selectedCategoryValue.value = '';
});

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
  <section
    class="rounded-xl border border-border bg-surface p-4"
  >
    <div class="flex items-center gap-4 border-b border-border pb-4">
      <p class="text-lg font-semibold text-foreground">
        Pádel Cantabria
      </p>
    </div>

    <p
      v-if="isPending"
      class="mt-4 text-sm text-muted"
    >
      Cargando ligas…
    </p>

    <p
      v-else-if="errorMessage"
      class="mt-4 text-sm text-danger"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-else-if="!leagues?.length"
      class="mt-4 text-sm text-muted"
    >
      No hay ligas disponibles.
    </p>

    <form
      v-else
      class="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end"
      @submit.prevent="search"
    >
      <div class="grid flex-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Select
          id="league"
          v-model="selectedLeagueId"
          label="Liga"
          :options="leagueOptions"
        />

        <Select
          id="gender"
          v-model="selectedGenderValue"
          label="Género"
          :options="genderOptions"
          :disabled="!selectedLeagueId"
        />

        <Select
          id="phase"
          v-model="selectedPhaseValue"
          label="Fase"
          :options="phaseOptions"
          :disabled="!selectedGenderValue"
        />

        <Select
          id="category"
          v-model="selectedCategoryValue"
          label="Categoría"
          :options="categoryOptions"
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
  </section>
</template>
