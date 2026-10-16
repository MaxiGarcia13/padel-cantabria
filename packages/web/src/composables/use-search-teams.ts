import type { Team } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';

const DEFAULT_LIMIT = 10;

async function fetchSearchTeams(query: string): Promise<Team[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(DEFAULT_LIMIT),
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

export function useSearchTeams(query: MaybeRefOrGetter<string>) {
  const queryKey = computed(() => ['teams', 'search', toValue(query)] as const);

  return useQuery({
    queryKey,
    queryFn: () => fetchSearchTeams(toValue(query)),
  });
}
