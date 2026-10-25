import type { Gender, League, Phase, SelectOption } from '@padel-cantabria/database';
import type { Ref } from 'vue';
import { computed, ref, watch } from 'vue';
import { getDefaultGenderValue } from './get-default-gender-value';

const EMPTY_GENDERS: Gender[] = [];
const EMPTY_PHASES: Phase[] = [];
const EMPTY_CATEGORIES: SelectOption[] = [];

export interface SearchFiltersInitial {
  leagueId?: string;
  genderValue?: string;
  phaseValue?: string;
  categoryValue?: string;
}

export function useSearchFilters(
  leagues: Ref<League[] | undefined>,
  initial: SearchFiltersInitial = {},
) {
  const leagueId = ref(initial.leagueId ?? '');
  const genderValue = ref(initial.genderValue ?? '');
  const phaseValue = ref(initial.phaseValue ?? '');
  const categoryValue = ref(initial.categoryValue ?? '');

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

  const selectedCategory = computed(() =>
    categories.value.find((category) => category.value === categoryValue.value),
  );

  const locationSummary = computed(() =>
    [
      selectedLeague.value?.name,
      selectedGender.value?.label,
      selectedPhase.value?.label,
      selectedCategory.value?.label,
    ]
      .filter(Boolean)
      .join(' / '),
  );

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

  watch(
    genders,
    (genderOptions) => {
      if (genderOptions.length === 1) {
        genderValue.value = genderOptions[0].value;
        return;
      }

      if (
        genderValue.value
        && !genderOptions.some((gender) => gender.value === genderValue.value)
      ) {
        genderValue.value = getDefaultGenderValue(genderOptions);
        phaseValue.value = '';
        categoryValue.value = '';
      }
    },
    { immediate: true },
  );

  watch(
    phases,
    (phaseOptions) => {
      if (phaseOptions.length === 1) {
        phaseValue.value = phaseOptions[0].value;
        return;
      }

      if (
        phaseValue.value
        && !phaseOptions.some((phase) => phase.value === phaseValue.value)
      ) {
        phaseValue.value = '';
        categoryValue.value = '';
      }
    },
    { immediate: true },
  );

  watch(
    categories,
    (categoryOptions) => {
      if (categoryOptions.length === 1) {
        categoryValue.value = categoryOptions[0].value;
        return;
      }

      if (
        categoryValue.value
        && !categoryOptions.some(
          (category) => category.value === categoryValue.value,
        )
      ) {
        categoryValue.value = '';
      }
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

  return {
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
  };
}
