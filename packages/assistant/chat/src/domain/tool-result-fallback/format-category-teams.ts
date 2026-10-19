import { isRecord } from '@/utils/parse-tool-json';
import { formatStandingTeam } from './format-standing-team';
import { joinDisplayParts, stringField } from './join-display-parts';

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
    return header ? `${header}\nSin equipos.` : 'Sin equipos.';
  }

  return [header, ...teams].filter(Boolean).join('\n');
}
