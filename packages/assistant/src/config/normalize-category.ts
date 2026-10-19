/**
 * Single place for category free-text → search tokens.
 * Chat/Hermes may pass a raw phrase; ordinal aliases and stopwords live here.
 */

const CATEGORY_ALIASES: Record<string, string> = {
  '1': '1ª',
  '1a': '1ª',
  '1ra': '1ª',
  '1era': '1ª',
  'primera': '1ª',
  '2': '2ª',
  '2a': '2ª',
  '2da': '2ª',
  '2ra': '2ª',
  'segunda': '2ª',
  '3': '3ª',
  '3a': '3ª',
  '3ra': '3ª',
  '3era': '3ª',
  'tercera': '3ª',
  '4': '4ª',
  '4a': '4ª',
  '4ta': '4ª',
  '4ra': '4ª',
  'cuarta': '4ª',
  '5': '5ª',
  '5a': '5ª',
  '5ta': '5ª',
  '5ra': '5ª',
  'quinta': '5ª',
  '6': '6ª',
  '6a': '6ª',
  '6ta': '6ª',
  '6ra': '6ª',
  'sexta': '6ª',
  '7': '7ª',
  '7a': '7ª',
  '7ma': '7ª',
  '7ra': '7ª',
  'septima': '7ª',
};

/** Fold for alias / stopword lookup: lowercase, strip diacritics, ª/º → a/o. */
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

/**
 * Words that never help disambiguate a category once gender is a separate filter.
 * Includes question filler so raw user turns can be passed through.
 */
const CATEGORY_STOP_KEYS = new Set([
  // structural / gender
  'categoria',
  'category',
  'grupo',
  'group',
  'masculina',
  'masculino',
  'femenina',
  'femenino',
  'masc',
  'fem',
  'm',
  'f',
  // question filler / articles
  'que',
  'cuales',
  'hay',
  'en',
  'la',
  'el',
  'los',
  'las',
  'de',
  'del',
  'un',
  'una',
  'me',
  'dime',
  'lista',
  'listar',
  'mostrar',
  'equipo',
  'equipos',
  'team',
  'teams',
  'which',
  'what',
  'are',
  'there',
  'in',
  'the',
  'a',
  'an',
  'show',
  'list',
  'all',
  'todas',
  'todos',
]);

export function normalizeCategoryToken(token: string): string {
  const trimmed = token.trim();
  if (!trimmed) {
    return trimmed;
  }

  const aliased = CATEGORY_ALIASES[categoryAliasKey(trimmed)];
  return aliased ?? trimmed;
}

function isCategoryStopToken(token: string): boolean {
  return CATEGORY_STOP_KEYS.has(categoryAliasKey(token));
}

/**
 * Expand aliases and drop noise so search tokens match DB labels.
 * "que equipos hay en 3ª CATEGORIA MASCULINA - GRUPO D?" → "3ª D"
 */
export function normalizeCategoryQuery(query: string): string {
  return query
    .trim()
    // Spaced / unicode dashes separate words; keep hyphen-minus inside ids.
    .replace(/\s*[-–—]\s+/g, ' ')
    .replace(/[–—_/|,.;:¿?¡!()[\]{}]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map(normalizeCategoryToken)
    .filter((token) => token.length > 0 && !isCategoryStopToken(token))
    .join(' ');
}
