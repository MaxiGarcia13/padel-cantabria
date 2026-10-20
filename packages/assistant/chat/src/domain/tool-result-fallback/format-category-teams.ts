import type { PresentedCategoryTeams } from '@presenters/presented-types';
import { formatStandingTeam } from './format-standing-team';
import { isPresentedStandingTeam } from './is-presented';
import { joinDisplayParts, stringField } from './join-display-parts';
import { asMarkdownList, joinMarkdownBlocks } from './markdown-blocks';

export function formatCategoryTeams(
  record: PresentedCategoryTeams,
): string | null {
  const header = joinDisplayParts([
    stringField(record, 'category') || null,
    stringField(record, 'gender') || null,
    stringField(record, 'phase') || null,
  ]);

  const teams = record.teams
    .map((entry) => {
      if (!isPresentedStandingTeam(entry)) {
        return String(entry);
      }
      return formatStandingTeam(entry) ?? JSON.stringify(entry);
    })
    .filter(Boolean);

  if (teams.length === 0) {
    return joinMarkdownBlocks([header, 'Sin equipos.']);
  }

  return joinMarkdownBlocks([header, asMarkdownList(teams)]);
}
