import { navigate } from 'astro:transitions/client';

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

    void navigate(`/${path}`);
  }

  function searchTeam(teamId: number): void {
    void navigate(`/team/${encodeURIComponent(String(teamId))}`);
  }

  return { search, searchTeam };
}
