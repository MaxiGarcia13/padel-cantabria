<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import type { TeamSearchHistoryItem } from './team-search-history.vue';
import type { AutocompleteItem } from '@/components/autocomplete';
import { debounce } from '@maxigarcia/js-utils';
import { computed, ref, watch } from 'vue';
import { Autocomplete } from '@/components/autocomplete';
import { useLeagues } from '@/composables/use-leagues';
import { useSearchTeams } from '@/composables/use-search-teams';
import { useTeamSearchHistory } from '@/composables/use-team-search-history';
import { getTeamDisplayLabels } from '@/domain/team/get-team-display-labels';
import TeamSearchHistory from './team-search-history.vue';

const props = defineProps<{
  selectedTeamId?: number | null;
  loading?: boolean;
}>();

const emit = defineEmits<{
  select: [team: Team];
}>();

const SEARCH_DELAY_MS = 500;

const query = defineModel<string>({ default: '' });
const searchQuery = ref(query.value.trim());
const selectedTeam = ref<Team | null>(null);
const autocompleteRef = ref<{ close: () => void } | null>(null);

const applySearch = debounce((value: string) => {
  searchQuery.value = value.trim();
}, SEARCH_DELAY_MS);

watch(
  query,
  (value) => {
    const trimmed = value.trim();

    if (!trimmed) {
      searchQuery.value = '';
      return;
    }

    void applySearch(value);
  },
  { immediate: true },
);

const { data: leagues } = useLeagues();
const { data: teams, isPending, isError } = useSearchTeams(searchQuery);
const { entries, add, remove } = useTeamSearchHistory();

const isQueryEmpty = computed(() => !query.value.trim());

const items = computed<AutocompleteItem[]>(() => {
  if (isQueryEmpty.value) {
    return [];
  }

  return (teams.value ?? []).map((team) => {
    const { categoryLabel, genderLabel } = getTeamDisplayLabels(
      leagues.value,
      team,
    );

    return {
      value: String(team.id),
      label: team.name,
      description: [categoryLabel, genderLabel].filter(Boolean).join(' · '),
    };
  });
});

const historyItems = computed<TeamSearchHistoryItem[]>(() =>
  entries.value.map((team) => {
    const { categoryLabel, genderLabel } = getTeamDisplayLabels(
      leagues.value,
      team,
    );

    return {
      team,
      description: [categoryLabel, genderLabel].filter(Boolean).join(' · '),
    };
  }),
);

watch(
  [() => props.selectedTeamId, teams],
  ([teamId, teamList]) => {
    if (teamId == null || !teamList) {
      return;
    }

    const match = teamList.find((team) => team.id === teamId);

    if (match) {
      selectedTeam.value = match;
      query.value = match.name;
    }
  },
  { immediate: true },
);

function selectTeam(team: Team): void {
  selectedTeam.value = team;
  query.value = team.name;
  add(team);
  emit('select', team);
  autocompleteRef.value?.close();
}

function onSelect(item: AutocompleteItem): void {
  const team = teams.value?.find((entry) => String(entry.id) === item.value);

  if (!team) {
    return;
  }

  selectTeam(team);
}

function onHistorySelect(team: Team): void {
  selectTeam(team);
}

defineExpose({
  selectedTeam,
  isPending,
  isError,
});
</script>

<template>
  <Autocomplete
    id="team-search"
    ref="autocompleteRef"
    v-model="query"
    placeholder="Buscar equipo"
    :items="items"
    :disabled="isError"
    :loading="loading"
    @select="onSelect"
  >
    <template
      v-if="isQueryEmpty && historyItems.length > 0"
      #empty
    >
      <TeamSearchHistory
        :items="historyItems"
        @select="onHistorySelect"
        @remove="remove"
      />
    </template>
  </Autocomplete>
</template>
