<script setup lang="ts">
import type { Team } from '@padel-cantabria/database';
import type { AutocompleteItem } from '@/components/autocomplete.vue';
import { debounce } from '@maxigarcia/js-utils';
import { computed, ref, watch } from 'vue';
import Autocomplete from '@/components/autocomplete.vue';
import { useSearchTeams } from '@/composables/use-search-teams';

const props = defineProps<{
  selectedTeamId?: number | null;
}>();

const emit = defineEmits<{
  select: [team: Team];
}>();

const SEARCH_DELAY_MS = 500;

const query = defineModel<string>({ default: '' });
const searchQuery = ref(query.value.trim());
const selectedTeam = ref<Team | null>(null);

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

const { data: teams, isPending, isError } = useSearchTeams(searchQuery);

const items = computed<AutocompleteItem[]>(() => {
  if (!query.value.trim()) {
    return [];
  }

  return (teams.value ?? []).map((team) => ({
    value: String(team.id),
    label: team.name,
    description: [team.category, team.gender].filter(Boolean).join(' · '),
  }));
});

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

function onSelect(item: AutocompleteItem): void {
  const team = teams.value?.find((entry) => String(entry.id) === item.value);

  if (!team) {
    return;
  }

  selectedTeam.value = team;
  emit('select', team);
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
    v-model="query"
    placeholder="Buscar equipo"
    :items="items"
    :disabled="isError"
    @select="onSelect"
  />
</template>
