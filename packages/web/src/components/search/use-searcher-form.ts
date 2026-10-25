import type { Team } from '@padel-cantabria/database';
import { computed, ref, watch } from 'vue';
import { useHydrated } from '@/composables/use-hydrated';
import { useLeagues } from '@/composables/use-leagues';
import { useSearchFilters } from '@/composables/use-search-filters';
import { useSearchNavigation } from '@/composables/use-search-navigation';

export interface SearcherFormInitial {
  leagueId?: string;
  genderValue?: string;
  phaseValue?: string;
  categoryValue?: string;
  filtersExpanded?: boolean;
}

export function useSearcherForm(initial: SearcherFormInitial) {
  const { data: leagues, isPending, isError } = useLeagues();
  const { search, searchTeam } = useSearchNavigation();

  const teamQuery = ref('');
  const selectedTeam = ref<Team | null>(null);
  const isNavigating = ref(false);
  const isHydrated = useHydrated();
  const hasInitialFilters = Boolean(
    initial.leagueId
    && initial.genderValue
    && initial.phaseValue
    && initial.categoryValue,
  );
  const filtersExpanded = ref(initial.filtersExpanded ?? hasInitialFilters);

  const showFiltersSkeleton = computed(
    () => !isHydrated.value || isPending.value,
  );

  const filters = useSearchFilters(leagues, {
    leagueId: initial.leagueId,
    genderValue: initial.genderValue,
    phaseValue: initial.phaseValue,
    categoryValue: initial.categoryValue,
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
    if (!filters.canSearch.value || isNavigating.value) {
      return;
    }

    isNavigating.value = true;
    search({
      leagueId: filters.leagueId.value,
      genderValue: filters.genderValue.value,
      phaseValue: filters.phaseValue.value,
      categoryValue: filters.categoryValue.value,
    });
  }

  return {
    leagues,
    teamQuery,
    isNavigating,
    filtersExpanded,
    showFiltersSkeleton,
    errorMessage,
    ...filters,
    onTeamSelect,
    toggleFilters,
    onSearchFilters,
  };
}
