import type { League } from '@padel-cantabria/database';
import { useQuery } from '@tanstack/vue-query';

async function fetchLeagues(): Promise<League[]> {
  const response = await fetch('/api/leagues');

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;

    throw new Error(payload?.error ?? 'Failed to load leagues');
  }

  return response.json() as Promise<League[]>;
}

export function useLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
    staleTime: 1000 * 60 * 60 * 24,
  });
}
