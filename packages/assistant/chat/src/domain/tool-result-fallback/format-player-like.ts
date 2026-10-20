import type { PresentedPlayerLike } from '@presenters/presented-types';
import { joinDisplayParts, stringField } from './join-display-parts';

export function formatPlayerLike(
  record: PresentedPlayerLike,
): string | null {
  const name = joinDisplayParts([
    stringField(record, 'name'),
    stringField(record, 'surname'),
  ]);

  if (!name) {
    return null;
  }

  const team = 'team' in record ? stringField(record, 'team') : '';
  const category = 'category' in record ? stringField(record, 'category') : '';

  return joinDisplayParts([
    name,
    team ? `equipo ${team}` : null,
    category || null,
    typeof record.position === 'number' ? `posición ${record.position}` : null,
    typeof record.points === 'number' ? `${record.points} puntos` : null,
  ]);
}
