import { isRecord, parseToolJson } from '../utils/parse-tool-json';

export interface CategoryCandidate {
  category: string;
  category_value: string;
  gender?: string;
  gender_code?: string;
  phase?: string;
  phase_value?: string;
}

export interface PendingCategoryClarification {
  kind: 'category';
  options: CategoryCandidate[];
  originalQuestion: string;
  gender: 'M' | 'F';
}

export type PendingClarification = PendingCategoryClarification;

const UNKNOWN_CATEGORY_MESSAGE
  = 'No encontré esa categoría. ¿Puedes reformularla?';

function asCandidate(value: unknown): CategoryCandidate | null {
  if (!isRecord(value)) {
    return null;
  }

  const category
    = typeof value.category === 'string' ? value.category.trim() : '';
  const categoryValue
    = typeof value.category_value === 'string'
      ? value.category_value.trim()
      : '';

  if (!category && !categoryValue) {
    return null;
  }

  return {
    category: category || categoryValue,
    category_value: categoryValue || category,
    ...(typeof value.gender === 'string' ? { gender: value.gender } : {}),
    ...(typeof value.gender_code === 'string'
      ? { gender_code: value.gender_code }
      : {}),
    ...(typeof value.phase === 'string' ? { phase: value.phase } : {}),
    ...(typeof value.phase_value === 'string'
      ? { phase_value: value.phase_value }
      : {}),
  };
}

function fold(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** Parse structured category errors from list_teams / get_top_players. */
export function parseCategoryToolError(toolText: string): {
  code: 'ambiguous_category' | 'unknown_category';
  candidates: CategoryCandidate[];
} | null {
  const parsed = parseToolJson(toolText);
  if (!isRecord(parsed)) {
    return null;
  }

  const code = parsed.code;
  if (code !== 'ambiguous_category' && code !== 'unknown_category') {
    return null;
  }

  const rawCandidates = Array.isArray(parsed.candidates)
    ? parsed.candidates
    : [];
  const candidates = rawCandidates
    .map((entry) => asCandidate(entry))
    .filter((entry): entry is CategoryCandidate => entry !== null);

  return { code, candidates };
}

export function formatUnknownCategoryMessage(): string {
  return UNKNOWN_CATEGORY_MESSAGE;
}

/** Spanish numbered list for the user to pick a category. */
export function formatCategoryClarification(
  candidates: CategoryCandidate[],
): string {
  if (candidates.length === 0) {
    return UNKNOWN_CATEGORY_MESSAGE;
  }

  const lines = candidates.map((candidate, index) => {
    const label = [candidate.category, candidate.gender, candidate.phase]
      .filter((part): part is string => Boolean(part && part.trim()))
      .join(' · ');
    return `${index + 1}. ${label || candidate.category_value}`;
  });

  return ['¿Cuál categoría?', ...lines].join('\n');
}

/**
 * Resolve a user reply to one candidate (1-based index or label substring).
 */
export function parseCategoryPick(
  reply: string,
  options: CategoryCandidate[],
): CategoryCandidate | null {
  if (options.length === 0) {
    return null;
  }

  const trimmed = reply.trim();
  if (!trimmed) {
    return null;
  }

  const asNumber = Number(trimmed);
  if (
    Number.isInteger(asNumber)
    && asNumber >= 1
    && asNumber <= options.length
  ) {
    return options[asNumber - 1] ?? null;
  }

  const foldedReply = fold(trimmed);
  const exact = options.find(
    (option) => fold(option.category) === foldedReply
      || fold(option.category_value) === foldedReply,
  );
  if (exact) {
    return exact;
  }

  const partial = options.filter((option) =>
    fold(option.category).includes(foldedReply),
  );
  if (partial.length === 1) {
    return partial[0] ?? null;
  }

  return null;
}

export function isCategoryToolErrorText(toolText: string): boolean {
  return parseCategoryToolError(toolText) !== null;
}
