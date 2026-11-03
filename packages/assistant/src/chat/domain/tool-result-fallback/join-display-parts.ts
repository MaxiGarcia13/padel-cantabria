export function joinDisplayParts(
  parts: Array<string | number | null | undefined>,
): string {
  return parts
    .map((part) => {
      if (typeof part === 'number') {
        return String(part);
      }
      if (typeof part !== 'string') {
        return '';
      }
      return part.trim();
    })
    .filter(Boolean)
    .join(' · ');
}

export function stringField<T extends object>(
  record: T,
  key: keyof T & string,
): string {
  const value = record[key];
  return typeof value === 'string'
    ? value.trim()
    : '';
}
