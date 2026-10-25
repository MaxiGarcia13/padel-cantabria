import type { CategoryKey, League, Team } from '@padel-cantabria/database';
import {
  foldText,
  getTeamDisplayLabels,
  resolveCompetitionLabels,
} from '@padel-cantabria/shared';
import { buildCategoryPath, buildTeamPath } from '@/routes';

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

const HOME_ITEM: BreadcrumbItem = { label: 'Inicio', href: '/' };

function categoryCrumbLabel(
  categoryLabel: string,
  genderLabel: string,
): string {
  if (!genderLabel) {
    return categoryLabel;
  }

  const foldedCategory = foldText(categoryLabel);
  const foldedGender = foldText(genderLabel);
  const genderAlreadyInLabel
    = foldedCategory.includes(foldedGender)
      || foldedCategory.includes('masculin')
      || foldedCategory.includes('femenin');

  if (genderAlreadyInLabel) {
    return categoryLabel;
  }

  return `${categoryLabel} · ${genderLabel}`;
}

function categoryItem(
  leagues: League[] | undefined,
  category: CategoryKey,
  options?: { current?: boolean },
): BreadcrumbItem {
  const labels = resolveCompetitionLabels(leagues, {
    leagueId: category.league_id,
    gender: category.gender,
    phase: category.phase,
    category: category.category,
  });
  const label = categoryCrumbLabel(labels.categoryLabel, labels.genderLabel);

  if (options?.current) {
    return { label };
  }

  return { label, href: buildCategoryPath(category) };
}

export function categoryBreadcrumbItems(
  leagues: League[] | undefined,
  category: CategoryKey,
): BreadcrumbItem[] {
  return [HOME_ITEM, categoryItem(leagues, category, { current: true })];
}

export function calendarBreadcrumbItems(
  leagues: League[] | undefined,
  category: CategoryKey,
): BreadcrumbItem[] {
  return [
    HOME_ITEM,
    categoryItem(leagues, category),
    { label: 'Calendario' },
  ];
}

export function matchBreadcrumbItems(
  leagues: League[] | undefined,
  category: CategoryKey,
  match: { home_team: string; away_team: string },
): BreadcrumbItem[] {
  return [
    HOME_ITEM,
    categoryItem(leagues, category),
    { label: `${match.home_team} vs ${match.away_team}` },
  ];
}

export function teamBreadcrumbItems(
  leagues: League[] | undefined,
  team: Team,
  phase: string,
): BreadcrumbItem[] {
  const { categoryLabel, genderLabel } = getTeamDisplayLabels(leagues, team);
  const category: CategoryKey = {
    league_id: team.league_id,
    gender: team.gender,
    phase,
    category: team.category,
  };

  return [
    HOME_ITEM,
    {
      label: categoryCrumbLabel(categoryLabel, genderLabel),
      href: phase ? buildCategoryPath(category) : undefined,
    },
    { label: team.name },
  ];
}

export function playerBreadcrumbItems(
  leagues: League[] | undefined,
  team: Team,
  phase: string,
  player: { name: string; surname: string },
): BreadcrumbItem[] {
  const { categoryLabel, genderLabel } = getTeamDisplayLabels(leagues, team);
  const category: CategoryKey = {
    league_id: team.league_id,
    gender: team.gender,
    phase,
    category: team.category,
  };

  return [
    HOME_ITEM,
    {
      label: categoryCrumbLabel(categoryLabel, genderLabel),
      href: phase ? buildCategoryPath(category) : undefined,
    },
    { label: team.name, href: buildTeamPath(team.id) },
    { label: `${player.name} ${player.surname}` },
  ];
}
