import type { League } from '@padel-cantabria/database';
import { useQuery } from '@tanstack/vue-query';
import { request } from '@/utils/request';

async function fetchLeagues(): Promise<League[]> {
  return request('/api/leagues').json<League[]>('Failed to load leagues');
}

export function useLeagues() {
  return useQuery({
    queryKey: ['leagues'],
    queryFn: fetchLeagues,
    staleTime: 24 * 60 * 60 * 1000,
  });
}
