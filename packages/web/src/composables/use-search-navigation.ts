import type { Team } from '@padel-cantabria/database';
import { prefetch } from 'astro:prefetch';
import { navigate } from 'astro:transitions/client';
import { buildCategoryPath, buildTeamPath, teamCategoryKey } from '@/routes';
import { request } from '@/utils/request';

function goTo(path: string): void {
  prefetch(path);
  void navigate(path);
}

async function resolveTeamPhase(
  teamId: number,
  preferredPhase?: string,
): Promise<string | null> {
  if (preferredPhase?.trim()) {
    return preferredPhase.trim();
  }

  const body = await request(`/api/team/${teamId}/phases`).json<{
    phases: string[];
  }>('Failed to load phases');

  return body.phases[0] ?? null;
}

export function useSearchNavigation() {
  function search(filters: {
    leagueId: string;
    genderValue: string;
    phaseValue: string;
    categoryValue: string;
  }): void {
    goTo(
      buildCategoryPath({
        league_id: Number(filters.leagueId),
        gender: filters.genderValue,
        phase: filters.phaseValue,
        category: filters.categoryValue,
      }),
    );
  }

  async function searchTeam(
    team: Team,
    preferredPhase?: string,
  ): Promise<void> {
    const phase = await resolveTeamPhase(team.id, preferredPhase);

    if (!phase) {
      goTo('/');
      return;
    }

    goTo(buildTeamPath(teamCategoryKey(team, phase), team.id));
  }

  return { search, searchTeam };
}
