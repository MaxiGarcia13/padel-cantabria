export type PositionTrend = 'up' | 'down' | 'same' | 'none';

export function getPositionTrend(
  position: number | null,
  previousPosition: number | null,
): PositionTrend {
  if (position === null || previousPosition === null) {
    return 'none';
  }

  if (position < previousPosition) {
    return 'up';
  }

  if (position > previousPosition) {
    return 'down';
  }

  return 'same';
}
