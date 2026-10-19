import type { CategoryMatch } from '@padel-cantabria/database';
import type { DatabaseClient } from '../db.js';
import {
  categoryAliasKey,
  normalizeCategoryQuery,
} from './normalize-category.js';

function labelKey(label: string): string {
  return categoryAliasKey(label);
}

function pickCategoryMatch(
  input: string,
  matches: CategoryMatch[],
): CategoryMatch | undefined {
  if (matches.length === 0) {
    return undefined;
  }

  const trimmed = input.trim();
  const exactValue = matches.find((match) => match.category === trimmed);
  if (exactValue) {
    return exactValue;
  }

  const inputKey = labelKey(trimmed);
  const exactLabel = matches.find(
    (match) => labelKey(match.category_label) === inputKey,
  );
  if (exactLabel) {
    return exactLabel;
  }

  if (matches.length === 1) {
    return matches[0];
  }

  return undefined;
}

/**
 * Resolve a model/user category string to a category match (value + phase).
 * Accepts value, label, or ordinal aliases (via search after alias expansion).
 */
export async function resolveCategoryMatch(
  db: DatabaseClient,
  options: {
    category: string;
    leagueId: number;
    gender: 'M' | 'F';
  },
): Promise<CategoryMatch | undefined> {
  const trimmed = options.category.trim();
  if (!trimmed) {
    return undefined;
  }

  const searchQuery = normalizeCategoryQuery(trimmed) || trimmed;

  const matches = await db.searchCategories({
    query: searchQuery,
    league_id: options.leagueId,
    gender: options.gender,
    limit: 15,
  });

  return pickCategoryMatch(searchQuery, matches)
    ?? pickCategoryMatch(trimmed, matches);
}

/**
 * Resolve a model/user category string to federation `categories.value`.
 * Accepts value, label, or ordinal aliases (via search after alias expansion).
 */
export async function resolveCategoryValue(
  db: DatabaseClient,
  options: {
    category: string;
    leagueId: number;
    gender: 'M' | 'F';
  },
): Promise<string | undefined> {
  const match = await resolveCategoryMatch(db, options);
  return match?.category;
}
