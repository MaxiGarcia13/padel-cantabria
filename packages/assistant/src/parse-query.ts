export function parseOptionalPositiveInt(
  value: string | undefined,
): number | undefined {
  if (value === undefined || value === '') {
    return undefined;
  }

  const parsed = Number(value);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return undefined;
  }

  return Math.floor(parsed);
}

export function parseRequiredPositiveInt(value: string | undefined): number {
  const parsed = parseOptionalPositiveInt(value);

  if (parsed === undefined) {
    return Number.NaN;
  }

  return parsed;
}
