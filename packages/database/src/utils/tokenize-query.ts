/** Split a free-text query into AND tokens; punctuation/dashes are separators. */
export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    .replace(/[-–—_/|,.;:¿?¡!()[\]{}]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}
