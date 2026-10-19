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

/**
 * Keep only real gender filters (M/F). Drop anything else before MCP.
 */
export function sanitizeToolArgs(
  args: Record<string, unknown>,
): Record<string, unknown> {
  if (!('gender' in args) || isValidGender(args.gender)) {
    return args;
  }

  const { gender: _ignored, ...rest } = args;
  return rest;
}
