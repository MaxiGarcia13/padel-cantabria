export function joinAndFilters(clauses: string[]): string {
  return clauses.length === 0 ? '1 = 1' : clauses.join('\n            AND ');
}
