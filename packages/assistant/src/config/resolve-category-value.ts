import type {
  CategoryMatch,
  DatabaseClient,
} from '@padel-cantabria/database';
import {
  categoryAliasKey,
  normalizeCategoryQuery,
} from '@padel-cantabria/shared';

export type CategoryResolveResult
  = | { status: 'matched'; match: CategoryMatch }
    | { status: 'unknown'; candidates: CategoryMatch[] }
    | { status: 'ambiguous'; candidates: CategoryMatch[] };

function labelKey(label: string): string {
  return categoryAliasKey(label);
}

function tokenHitsLabel(haystackKey: string, token: string): boolean {
  const key = categoryAliasKey(token);
  if (!key) {
    return false;
  }

  // Single letters are group codes (A–D), not substring noise.
  if (key.length === 1) {
    return (
      haystackKey.includes(`grupo ${key}`)
      || haystackKey.includes(`group ${key}`)
    );
  }

  return haystackKey.includes(key);
}

function scoreCategoryMatch(match: CategoryMatch, query: string): number {
  const haystack = labelKey(match.category_label);
  const tokens = normalizeCategoryQuery(query).split(/\s+/).filter(Boolean);

  if (tokens.length === 0) {
    return 0;
  }

  return tokens.reduce(
    (score, token) => (tokenHitsLabel(haystack, token) ? score + 1 : score),
    0,
  );
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

  const scored = matches
    .map((match) => ({ match, score: scoreCategoryMatch(match, trimmed) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return undefined;
  }

  const best = scored[0]!;
  const tied = scored.filter((entry) => entry.score === best.score);
  return tied.length === 1 ? best.match : undefined;
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
