import type { PresentedStandingTeam } from '@presenters/presented-types';
import { joinDisplayParts, stringField } from './join-display-parts';

export function formatStandingTeam(
  record: PresentedStandingTeam,
): string | null {
  const name = stringField(record, 'name');
  if (!name) {
    return null;
  }

  return joinDisplayParts([
    name,
    typeof record.position === 'number' ? `posición ${record.position}` : null,
    typeof record.points === 'number' ? `${record.points} puntos` : null,
  ]);
}
