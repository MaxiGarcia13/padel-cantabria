<script setup lang="ts">
import type {
  Gender,
  Phase,
  SelectOption,
} from '@padel-cantabria/database';
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
</script>

<template>
  <div class="flex w-full max-w-md flex-col gap-6">
    <p
      v-if="isPending"
      class="text-sm text-zinc-400"
    >
      Cargando ligas…
    </p>

    <p
      v-else-if="errorMessage"
      class="text-sm text-red-400"
      role="alert"
    >
      {{ errorMessage }}
    </p>

    <p
      v-else-if="!leagues?.length"
      class="text-sm text-zinc-400"
    >
      No hay ligas disponibles.
    </p>

    <form
      v-else
      class="flex flex-col gap-4"
      @submit.prevent
    >
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
    </form>
  </div>
</template>
