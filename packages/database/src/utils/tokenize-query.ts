/**
 * Split a free-text query into AND tokens.
 * Spaced / unicode dashes are separators; hyphen-minus inside tokens
 * (e.g. category_value ids) is kept.
 */
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .replace(/\s*[-–—]\s+/g, ' ')
    .replace(/[–—_/|,.;:¿?¡!()[\]{}]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}
