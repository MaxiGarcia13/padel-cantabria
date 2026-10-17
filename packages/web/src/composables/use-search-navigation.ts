import { prefetch } from 'astro:prefetch';
import { navigate } from 'astro:transitions/client';

function goTo(path: string): void {
  prefetch(path);
  void navigate(path);
}

export function useSearchNavigation() {
  function search(filters: {
    leagueId: string;
    genderValue: string;
    phaseValue: string;
    categoryValue: string;
  }): void {
    const path = [
      'league',
      filters.leagueId,
      filters.genderValue,
      filters.phaseValue,
      filters.categoryValue,
    ]
      .map((segment) => encodeURIComponent(segment))
      .join('/');

    goTo(`/${path}`);
  }

  function searchTeam(teamId: number): void {
    goTo(`/team/${encodeURIComponent(String(teamId))}`);
  }

  return { search, searchTeam };
}
