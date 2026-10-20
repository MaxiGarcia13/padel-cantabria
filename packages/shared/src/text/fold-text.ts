/** Lowercase and strip diacritics for loose text matching. */
export function foldText(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}
