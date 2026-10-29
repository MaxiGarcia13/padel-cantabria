import type {
  PresentedRosterTotals,
  PresentedTeamRoster,
} from '@presenters/presented-types';
import { formatPlayerLike } from './format-player-like';
import { isPresentedPlayerLike } from './is-presented';
import { joinDisplayParts, stringField } from './join-display-parts';
import { asMarkdownList, joinMarkdownBlocks } from './markdown-blocks';

function formatRosterTotals(totals: PresentedRosterTotals): string | null {
  const playerCount = totals.player_count;
  const points = totals.points;
  if (typeof playerCount !== 'number' || typeof points !== 'number') {
    return null;
  }

  const previous = totals.previous_points;
  const previousPart
    = typeof previous === 'number'
      ? `, ${previous} pts anteriores`
      : '';

  return `Total: ${playerCount} jugadores, ${points} pts${previousPart}`;
}

export function formatTeamRoster(
  record: PresentedTeamRoster,
): string | null {
  const header = joinDisplayParts([
    stringField(record.team, 'name') || null,
    stringField(record.team, 'gender') || null,
    stringField(record.team, 'category') || null,
  ]);

  const totals = formatRosterTotals(record.totals);

  const players = record.players
    .map((entry) => {
      if (!isPresentedPlayerLike(entry)) {
        return String(entry);
      }
      return formatPlayerLike(entry) ?? JSON.stringify(entry);
    })
    .filter(Boolean);

  if (players.length === 0) {
    return joinMarkdownBlocks([header, 'Sin jugadores.', totals]);
  }

  return joinMarkdownBlocks([
    header,
    totals,
    asMarkdownList(players),
  ]);
}
