import type { CategoryMatch, DatabaseClient } from '@padel-cantabria/database';
import { getConfiguredLeagueId } from '@padel-cantabria/database';
import { normalizeGender } from '@padel-cantabria/shared';
import { badRequest } from '../errors.js';
import { requireCategoryMatch } from './require-category-match.js';
import { resolveCategoryMatchResult } from './resolve-category-value.js';

export interface RequireConfiguredCategoryInput {
  gender?: string;
  category?: string;
}

export interface ConfiguredCategory {
  leagueId: number;
  gender: 'M' | 'F';
  categoryMatch: CategoryMatch;
}

export async function requireConfiguredCategory(
  db: DatabaseClient,
  { gender, category }: RequireConfiguredCategoryInput,
): Promise<ConfiguredCategory> {
  const normalizedGender = normalizeGender(gender);

  if (!normalizedGender) {
    throw badRequest('Missing gender (use M or F, or ask the user)');
  }

  if (!category?.trim()) {
    throw badRequest('Missing category');
  }

  const leagueId = getConfiguredLeagueId();
  const resolved = await resolveCategoryMatchResult(db, {
    category,
    leagueId,
    gender: normalizedGender,
  });

  return {
    leagueId,
    gender: normalizedGender,
    categoryMatch: requireCategoryMatch(resolved),
  };
}
