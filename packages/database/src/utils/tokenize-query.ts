export function tokenizeQuery(query: string): string[] {
  return query
    .trim()
    // Spaced / unicode dashes separate words; keep hyphen-minus inside ids.
    .replace(/\s*[-–—]\s+/g, ' ')
    .replace(/[–—_/|,.;:¿?¡!()[\]{}]+/g, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);
}
