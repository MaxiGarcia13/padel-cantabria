/**
 * Map common Spanish / shorthand category tokens to a canonical ordinal form
 * (e.g. "tercera" → "3ª") so search and value resolution can match DB labels.
 * Unknown tokens are returned trimmed unchanged.
 */

const CATEGORY_ALIASES: Record<string, string> = {
  '1': '1ª',
  '1a': '1ª',
  '1ra': '1ª',
  '1era': '1ª',
  primera: '1ª',
  '2': '2ª',
  '2a': '2ª',
  '2da': '2ª',
  '2ra': '2ª',
  segunda: '2ª',
  '3': '3ª',
  '3a': '3ª',
  '3ra': '3ª',
  '3era': '3ª',
  tercera: '3ª',
  '4': '4ª',
  '4a': '4ª',
  '4ta': '4ª',
  '4ra': '4ª',
  cuarta: '4ª',
  '5': '5ª',
  '5a': '5ª',
  '5ta': '5ª',
  '5ra': '5ª',
  quinta: '5ª',
  '6': '6ª',
  '6a': '6ª',
  '6ta': '6ª',
  '6ra': '6ª',
  sexta: '6ª',
};

/** Fold for alias lookup: lowercase, strip diacritics, ª/º → a/o. */
export function categoryAliasKey(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/ª/g, 'a')
    .replace(/º/g, 'o')
    .replace(/\./g, '');
}

export function normalizeCategoryToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return trimmed;
  }

  const aliased = CATEGORY_ALIASES[categoryAliasKey(trimmed)];
  return aliased ?? trimmed;
}

/** Expand aliases in a free-text category query (space-separated tokens). */
export function normalizeCategoryQuery(query: string): string {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeCategoryToken)
    .join(' ');
}
