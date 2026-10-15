<script setup lang="ts">
import type { Gender, Phase, SelectOption } from '@padel-cantabria/database';
import { navigate } from 'astro:transitions/client';
import { computed, ref, watch } from 'vue';
import { useLeagues } from '@/composables/use-leagues';
import CategorySelect from './category-select.vue';
import GenderSelect from './gender-select.vue';
import { getDefaultGenderValue } from './get-default-gender-value';
import LeagueSelect from './league-select.vue';
import PhaseSelect from './phase-select.vue';

const EMPTY_GENDERS: Gender[] = [];
const EMPTY_PHASES: Phase[] = [];
const EMPTY_CATEGORIES: SelectOption[] = [];

const props = defineProps<{
  initialLeagueId?: string;
  initialGenderValue?: string;
  initialPhaseValue?: string;
  initialCategoryValue?: string;
}>();

const { data: leagues, isPending, isError, error } = useLeagues();

const leagueId = ref(props.initialLeagueId ?? '');
const genderValue = ref(props.initialGenderValue ?? '');
const phaseValue = ref(props.initialPhaseValue ?? '');
const categoryValue = ref(props.initialCategoryValue ?? '');

const selectedLeague = computed(() =>
  leagues.value?.find(
    (league) => String(league.league_id) === leagueId.value,
  ),
);

const genders = computed(
  () => selectedLeague.value?.genders ?? EMPTY_GENDERS,
);

const selectedGender = computed(() =>
  genders.value.find((gender) => gender.value === genderValue.value),
);

const phases = computed(() => selectedGender.value?.phases ?? EMPTY_PHASES);

const selectedPhase = computed(() =>
  phases.value.find((phase) => phase.value === phaseValue.value),
);

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
      leagueId.value
      && genderValue.value
      && phaseValue.value
      && categoryValue.value,
    ),
);

watch(
  leagues,
  (leagueList) => {
    if (!leagueList?.length || leagueId.value) {
      return;
    }

    leagueId.value = String(leagueList[0].league_id);
    genderValue.value = getDefaultGenderValue(leagueList[0].genders);
  },
  { immediate: true },
);

function onLeagueChange(value: string): void {
  leagueId.value = value;
  genderValue.value = getDefaultGenderValue(
    leagues.value?.find((league) => String(league.league_id) === value)
      ?.genders ?? EMPTY_GENDERS,
  );
  phaseValue.value = '';
  categoryValue.value = '';
}

function onGenderChange(value: string): void {
  genderValue.value = value;
  phaseValue.value = '';
  categoryValue.value = '';
}

function onPhaseChange(value: string): void {
  phaseValue.value = value;
  categoryValue.value = '';
}

function search(): void {
  if (!canSearch.value) {
    return;
  }

  const path = [
    leagueId.value,
    genderValue.value,
    phaseValue.value,
    categoryValue.value,
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
      class="rounded-xl bg-primary px-6 py-2 font-medium text-primary-foreground disabled:cursor-not-allowed disabled:opacity-40"
      :disabled="!canSearch"
    >
      Buscar
    </button>
  </form>
</template>
