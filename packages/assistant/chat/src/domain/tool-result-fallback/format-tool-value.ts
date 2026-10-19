import { isRecord } from '@/utils/parse-tool-json';
import { formatCategoryLike } from './format-category-like';
import { formatCategoryTeams } from './format-category-teams';
import { formatPlayerLike } from './format-player-like';
import { formatStandingTeam } from './format-standing-team';
import { formatTeamRoster } from './format-team-roster';

function formatRecord(record: Record<string, unknown>): string {
  return (
    formatTeamRoster(record)
    ?? formatCategoryTeams(record)
    ?? formatPlayerLike(record)
    ?? formatStandingTeam(record)
    ?? formatCategoryLike(record)
    ?? JSON.stringify(record, null, 2)
  );
}

/** Turn a parsed tool JSON value into Spanish display text. */
export function formatToolValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Sin resultados.';
    }

    return value
      .map((entry) => {
        if (isRecord(entry)) {
          return formatRecord(entry);
        }
        return String(entry);
      })
      .join('\n');
  }

  if (isRecord(value)) {
    return formatRecord(value);
  }

  return String(value);
}
