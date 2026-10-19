import {
  categoryQueryFromUserMessage,
  inferGenderFromText,
} from './category-teams-intent';
import { isRecord, parseToolJson } from './parse-tool-json';

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
    .replace(/\p{M}/gu, '');
}

function significantTokens(text: string): string[] {
  return fold(text)
    .split(/[^a-z0-9ª]+/u)
    .map((token) => token.replace(/ª/g, 'a'))
    .filter((token) => token.length >= 2)
    .filter(
      (token) =>
        !['de', 'del', 'la', 'el', 'los', 'las', 'en', 'grupo', 'categoria', 'category', 'group'].includes(
          token,
        ),
    );
}

function scoreCategory(category: FlatCategory, userMessage: string): number {
  const haystack = fold(`${category.category} ${category.categoryValue}`);
  const tokens = significantTokens(userMessage);

  if (tokens.length === 0) {
    return 0;
  }

  return tokens.reduce(
    (score, token) => (haystack.includes(token) ? score + 1 : score),
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
): FlatCategory | null {
  if (categories.length === 0) {
    return null;
  }

  if (categories.length === 1) {
    return categories[0] ?? null;
  }

  const scored = categories
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
 * Prefers a unique/best category from tool results; falls back to the question text.
 */
export function resolveListTeamsArgs(
  toolResults: string[],
  userMessage: string,
): ListTeamsArgs | null {
  const categories = toolResults.flatMap((text) => {
    const parsed = parseToolJson(text);
    return parsed === null ? [] : flattenCategories(parsed);
  });

  const best = pickBestCategory(categories, userMessage);
  const gender
    = inferGenderFromText(userMessage)
      ?? best?.genderCode
      ?? undefined;

  if (!gender) {
    return null;
  }

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
