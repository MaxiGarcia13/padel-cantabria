const IGNORED_GENDER_VALUES = new Set([
  'omit',
  'unknown',
  'null',
  'undefined',
  'none',
  'n/a',
  'na',
  'any',
  'all',
  '',
]);

/**
 * Map Spanish / display labels to federation gender values stored in the DB.
 * Invalid or placeholder values from the model are treated as unset.
 */
export function normalizeGender(
  value: string | undefined,
): 'M' | 'F' | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (IGNORED_GENDER_VALUES.has(normalized)) {
    return undefined;
  }

  if (normalized === 'm' || normalized.startsWith('masc')) {
    return 'M';
  }

  if (normalized === 'f' || normalized.startsWith('fem')) {
    return 'F';
  }

  return undefined;
}
