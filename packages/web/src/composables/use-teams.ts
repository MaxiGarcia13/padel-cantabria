import type { CategoryKey, Team } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

async function fetchTeams(category: CategoryKey): Promise<Team[]> {
  const params = new URLSearchParams({
    league: String(category.league_id),
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });
  const response = await fetch(`/api/teams?${params}`);

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'No se pudieron cargar los equipos');
  }

  return response.json() as Promise<Team[]>;
}

export function useTeams(category: MaybeRefOrGetter<CategoryKey>) {
  const queryKey = computed(() => {
    const value = toValue(category);

    return [
      'teams',
      value.league_id,
      value.gender,
      value.phase,
      value.category,
    ] as const;
  });

  return useQuery({
    queryKey,
    queryFn: () => fetchTeams(toValue(category)),
  });
}
