import type { Team } from '@padel-cantabria/database';
import type { MaybeRefOrGetter } from 'vue';
import { useQuery } from '@tanstack/vue-query';
import { computed, toValue } from 'vue';
import { request } from '@/utils/request';

const DEFAULT_LIMIT = 10;

async function fetchSearchTeams(query: string): Promise<Team[]> {
  const params = new URLSearchParams({
    q: query,
    limit: String(DEFAULT_LIMIT),
  });

  return request(`/api/teams?${params}`).json<Team[]>('Failed to load teams');
}

export function useSearchTeams(query: MaybeRefOrGetter<string>) {
  const normalizedQuery = computed(() => toValue(query).trim());
  const queryKey = computed(
    () => ['teams', 'search', normalizedQuery.value] as const,
  );

  return useQuery({
    queryKey,
    queryFn: () => fetchSearchTeams(normalizedQuery.value),
    enabled: computed(() => normalizedQuery.value.length > 0),
    staleTime: 1000 * 60 * 5,
  });
}
