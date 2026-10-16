import type { Team } from '@padel-cantabria/database';
import { createStorage } from '@maxigarcia/js-utils';
import { ref } from 'vue';

const MAX_HISTORY_ENTRIES = 8;
const teamSearchHistoryStorage = createStorage<Team[]>('team-search-history');

export function useTeamSearchHistory() {
  const entries = ref<Team[]>(teamSearchHistoryStorage.getJson() ?? []);

  function persist(next: Team[]): void {
    entries.value = next;
    teamSearchHistoryStorage.setJson(next);
  }

  function add(team: Team): void {
    const next = [
      team,
      ...entries.value.filter((entry) => entry.id !== team.id),
    ].slice(0, MAX_HISTORY_ENTRIES);

    persist(next);
  }

  function remove(teamId: number): void {
    persist(entries.value.filter((entry) => entry.id !== teamId));
  }

  return { entries, add, remove };
}
