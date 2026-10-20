export function safeLimit(
  limit: number | undefined,
  defaultLimit: number,
): number {
  return Number.isFinite(limit) && limit != null && limit > 0
    ? Math.floor(limit)
    : defaultLimit;
}
