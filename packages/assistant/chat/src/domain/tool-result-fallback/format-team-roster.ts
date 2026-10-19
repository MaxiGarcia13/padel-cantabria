import { isRecord } from '@/utils/parse-tool-json';
import { formatPlayerLike } from './format-player-like';
import { joinDisplayParts, stringField } from './join-display-parts';

export function formatTeamRoster(
  record: Record<string, unknown>,
): string | null {
  if (!Array.isArray(record.players)) {
    return null;
  }

  const team = isRecord(record.team) ? record.team : null;
  const header = team
    ? joinDisplayParts([
        stringField(team, 'name') || null,
        stringField(team, 'gender') || null,
        stringField(team, 'category') || null,
      ])
    : '';

  const players = record.players
    .map((entry) => {
      if (!isRecord(entry)) {
        return String(entry);
      }
      return formatPlayerLike(entry) ?? JSON.stringify(entry);
    })
    .filter(Boolean);

  if (players.length === 0) {
    return header ? `${header}\nSin jugadores.` : 'Sin jugadores.';
  }

  return [header, ...players].filter(Boolean).join('\n');
}
