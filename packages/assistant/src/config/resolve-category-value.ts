import type { CategoryMatch } from '@padel-cantabria/database';
import type { DatabaseClient } from '../db.js';
import {
  categoryAliasKey,
  normalizeCategoryQuery,
} from './normalize-category.js';

function labelKey(label: string): string {
  return categoryAliasKey(label);
}

function pickCategoryValue(
  input: string,
  matches: CategoryMatch[],
): string | undefined {
  if (matches.length === 0) {
    return undefined;
  }

  const trimmed = input.trim();
  const exactValue = matches.find((match) => match.category === trimmed);
  if (exactValue) {
    return exactValue.category;
  }

  const inputKey = labelKey(trimmed);
  const exactLabel = matches.find(
    (match) => labelKey(match.category_label) === inputKey,
  );
  if (exactLabel) {
    return exactLabel.category;
  }

  if (matches.length === 1) {
    return matches[0]!.category;
  }

  return undefined;
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

  return pickCategoryValue(searchQuery, matches)
    ?? pickCategoryValue(trimmed, matches);
}
