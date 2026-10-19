import { isRecord, parseToolJson } from '../utils/parse-tool-json';
import {
  categoryQueryFromUserMessage,
  inferGenderFromText,
} from './category-teams-intent';

export interface ListTeamsArgs {
  gender: 'M' | 'F';
  category: string;
  phase?: string;
}

interface FlatCategory {
  category: string;
  categoryValue: string;
  genderCode: 'M' | 'F' | undefined;
  phaseValue: string | undefined;
}

/** Client-side ordinal aliases (mirror assistant normalize-category). */
const ORDINAL_ALIASES: Record<string, string[]> = {
  'primera': ['primera', '1a', '1'],
  'segunda': ['segunda', '2a', '2'],
  'tercera': ['tercera', '3a', '3'],
  'cuarta': ['cuarta', '4a', '4'],
  'quinta': ['quinta', '5a', '5'],
  'sexta': ['sexta', '6a', '6'],
  '1a': ['1a', '1', 'primera'],
  '2a': ['2a', '2', 'segunda'],
  '3a': ['3a', '3', 'tercera'],
  '4a': ['4a', '4', 'cuarta'],
  '5a': ['5a', '5', 'quinta'],
  '6a': ['6a', '6', 'sexta'],
};

const STOP_TOKENS = new Set([
  'de',
  'del',
  'la',
  'el',
  'los',
  'las',
  'en',
  'grupo',
  'categoria',
  'category',
  'group',
  'equipos',
  'equipo',
  'teams',
  'team',
]);

function asGenderCode(value: unknown): 'M' | 'F' | undefined {
  if (value === 'M' || value === 'F') {
    return value;
  }

  if (typeof value !== 'string') {
    return undefined;
  }

  const normalized = value.trim().toLowerCase();
  if (normalized === 'm' || normalized.startsWith('masc')) {
    return 'M';
  }

  if (normalized === 'f' || normalized.startsWith('fem')) {
    return 'F';
  }

  return undefined;
}

function fold(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ª/g, 'a')
    .replace(/º/g, 'o');
}

function significantTokens(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9]+/u)
    .filter(Boolean)
    .filter((token) => {
      if (STOP_TOKENS.has(token)) {
        return false;
      }
      // Keep group letters (A–Z) even at length 1.
      if (token.length === 1) {
        return /^[a-z]$/.test(token);
      }
      return token.length >= 2;
    });
}

function tokenVariants(token: string): string[] {
  return ORDINAL_ALIASES[token] ?? [token];
}

function tokenMatches(haystack: string, token: string): boolean {
  if (token.length === 1) {
    return (
      haystack.includes(`grupo ${token}`)
      || haystack.includes(`group ${token}`)
    );
  }

  return tokenVariants(token).some((variant) => haystack.includes(variant));
}

function scoreCategory(category: FlatCategory, userMessage: string): number {
  const haystack = fold(`${category.category} ${category.categoryValue}`);
  const tokens = significantTokens(userMessage);

  if (tokens.length === 0) {
    return 0;
  }

  return tokens.reduce(
    (score, token) => (tokenMatches(haystack, token) ? score + 1 : score),
    0,
  );
}

function fromPresentedCategory(value: unknown): FlatCategory | null {
  if (!isRecord(value)) {
    return null;
  }

  const categoryValue
    = typeof value.category_value === 'string' ? value.category_value.trim() : '';
  const category
    = typeof value.category === 'string' ? value.category.trim() : categoryValue;

  if (!categoryValue && !category) {
    return null;
  }

  let phaseValue: string | undefined;
  if (typeof value.phase_value === 'string') {
    phaseValue = value.phase_value;
  } else if (typeof value.phase === 'string') {
    phaseValue = value.phase;
  }

  return {
    category: category || categoryValue,
    categoryValue: categoryValue || category,
    genderCode: asGenderCode(value.gender_code) ?? asGenderCode(value.gender),
    phaseValue,
  };
}

function flattenCategories(value: unknown, acc: FlatCategory[] = []): FlatCategory[] {
  if (Array.isArray(value)) {
    for (const entry of value) {
      flattenCategories(entry, acc);
    }
    return acc;
  }

  if (!isRecord(value)) {
    return acc;
  }

  const presented = fromPresentedCategory(value);
  if (presented) {
    acc.push(presented);
  }

  for (const nested of Object.values(value)) {
    if (Array.isArray(nested) || isRecord(nested)) {
      flattenCategories(nested, acc);
    }
  }

  return acc;
}

function pickBestCategory(
  categories: FlatCategory[],
  userMessage: string,
  gender: 'M' | 'F',
): FlatCategory | null {
  const scoped = categories.filter(
    (category) => !category.genderCode || category.genderCode === gender,
  );

  if (scoped.length === 0) {
    return null;
  }

  const scored = scoped
    .map((category) => ({ category, score: scoreCategory(category, userMessage) }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score);

  if (scored.length === 0) {
    return null;
  }

  const best = scored[0]!;
  const tied = scored.filter((entry) => entry.score === best.score);
  if (tied.length !== 1) {
    return null;
  }

  return best.category;
}

/**
 * Build list_teams args from prior tool JSON and/or the user question.
 * Gender must come from the user text — never inferred from the first tool hit.
 */
export function resolveListTeamsArgs(
  toolResults: string[],
  userMessage: string,
): ListTeamsArgs | null {
  const gender = inferGenderFromText(userMessage);
  if (!gender) {
    return null;
  }

  const categories = toolResults.flatMap((text) => {
    const parsed = parseToolJson(text);
    return parsed === null ? [] : flattenCategories(parsed);
  });

  const best = pickBestCategory(categories, userMessage, gender);

  const category
    = best?.categoryValue
      || best?.category
      || categoryQueryFromUserMessage(userMessage);

  if (!category) {
    return null;
  }

  return {
    gender,
    category,
    ...(best?.phaseValue ? { phase: best.phaseValue } : {}),
  };
}
