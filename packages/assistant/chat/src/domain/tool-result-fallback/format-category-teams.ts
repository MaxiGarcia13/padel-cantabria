import { isRecord } from '@/utils/parse-tool-json';
import { formatStandingTeam } from './format-standing-team';
import { joinDisplayParts, stringField } from './join-display-parts';
import { asMarkdownList, joinMarkdownBlocks } from './markdown-blocks';

export function formatCategoryTeams(
  record: Record<string, unknown>,
): string | null {
  if (!Array.isArray(record.teams)) {
    return null;
  }

  const header = joinDisplayParts([
    stringField(record, 'category') || null,
    stringField(record, 'gender') || null,
    stringField(record, 'phase') || null,
  ]);

  const teams = record.teams
    .map((entry) => {
      if (!isRecord(entry)) {
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
