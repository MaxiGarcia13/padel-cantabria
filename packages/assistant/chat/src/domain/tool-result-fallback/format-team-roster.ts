import { isRecord } from '@/utils/parse-tool-json';
import { formatPlayerLike } from './format-player-like';
import { joinDisplayParts, stringField } from './join-display-parts';
import { asMarkdownList, joinMarkdownBlocks } from './markdown-blocks';

function formatRosterTotals(totals: Record<string, unknown>): string | null {
  const playerCount = totals.player_count;
  const points = totals.points;
  if (typeof playerCount !== 'number' || typeof points !== 'number') {
    return null;
  }

  const previous = totals.previous_points;
  const previousPart
    = typeof previous === 'number' ? `, ${previous} pts anteriores` : '';

  return `Total: ${playerCount} jugadores, ${points} pts${previousPart}`;
}

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

  const totals = isRecord(record.totals)
    ? formatRosterTotals(record.totals)
    : null;

  const players = record.players
    .map((entry) => {
      if (!isRecord(entry)) {
        return String(entry);
      }
      return formatPlayerLike(entry) ?? JSON.stringify(entry);
    })
    .filter(Boolean);

  if (players.length === 0) {
    return joinMarkdownBlocks([header, 'Sin jugadores.', totals]);
  }

  return joinMarkdownBlocks([header, totals, asMarkdownList(players)]);
}
