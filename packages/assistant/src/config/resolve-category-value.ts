import type { CategoryMatch } from '@padel-cantabria/database';
import type { DatabaseClient } from '../db.js';
import {
  categoryAliasKey,
  normalizeCategoryQuery,
} from './normalize-category.js';

export type CategoryResolveResult
  = | { status: 'matched'; match: CategoryMatch }
    | { status: 'unknown'; candidates: CategoryMatch[] }
    | { status: 'ambiguous'; candidates: CategoryMatch[] };

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

async function searchCategoryMatches(
  db: DatabaseClient,
  options: {
    category: string;
    leagueId: number;
    gender: 'M' | 'F';
  },
): Promise<{ searchQuery: string; trimmed: string; matches: CategoryMatch[] }> {
  const trimmed = options.category.trim();
  const searchQuery = normalizeCategoryQuery(trimmed) || trimmed;

  if (!trimmed) {
    return { searchQuery, trimmed, matches: [] };
  }

  const matches = await db.searchCategories({
    query: searchQuery,
    league_id: options.leagueId,
    gender: options.gender,
    limit: 15,
  });

  return { searchQuery, trimmed, matches };
}

/**
 * Resolve a category or return search candidates when unknown/ambiguous.
 */
export async function resolveCategoryMatchResult(
  db: DatabaseClient,
  options: {
    category: string;
    leagueId: number;
    gender: 'M' | 'F';
  },
): Promise<CategoryResolveResult> {
  const { searchQuery, trimmed, matches } = await searchCategoryMatches(
    db,
    options,
  );

  if (!trimmed) {
    return { status: 'unknown', candidates: [] };
  }

  const match
    = pickCategoryMatch(searchQuery, matches)
      ?? pickCategoryMatch(trimmed, matches);

  if (match) {
    return { status: 'matched', match };
  }

  if (matches.length === 0) {
    return { status: 'unknown', candidates: [] };
  }

  return { status: 'ambiguous', candidates: matches };
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
  const result = await resolveCategoryMatchResult(db, options);
  return result.status === 'matched' ? result.match : undefined;
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
