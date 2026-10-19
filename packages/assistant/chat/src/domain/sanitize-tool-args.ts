function isValidGender(value: unknown): boolean {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.trim().toLowerCase();

  return (
    normalized === 'm'
    || normalized === 'f'
    || normalized.startsWith('masc')
    || normalized.startsWith('fem')
  );
}

function pickNonEmptyString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

/**
 * Normalize model tool args before MCP.
 * - Drop invalid gender values
 * - Map category_value / phase_value aliases → category / phase
 */
export function sanitizeToolArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  const next: Record<string, unknown> = { ...args };

  const category = pickNonEmptyString(next.category, next.category_value);
  if (category) {
    next.category = category;
  }
  delete next.category_value;

  const phase = pickNonEmptyString(next.phase, next.phase_value);
  if (phase) {
    next.phase = phase;
  }
  delete next.phase_value;

  if ('gender' in next && !isValidGender(next.gender)) {
    delete next.gender;
  }

  return next;
}
