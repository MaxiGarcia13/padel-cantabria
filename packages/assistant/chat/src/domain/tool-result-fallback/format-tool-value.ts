import { isRecord } from '@/utils/parse-tool-json';
import { formatCategoryLike } from './format-category-like';
import { formatCategoryTeams } from './format-category-teams';
import { formatPlayerLike } from './format-player-like';
import { formatStandingTeam } from './format-standing-team';
import { formatTeamRoster } from './format-team-roster';
import {
  isPresentedCategory,
  isPresentedCategoryTeams,
  isPresentedPlayerLike,
  isPresentedStandingTeam,
  isPresentedTeamRoster,
} from './is-presented';
import { asMarkdownList, joinMarkdownBlocks } from './markdown-blocks';

function formatRecord(record: Record<string, unknown>): string {
  if (isPresentedTeamRoster(record)) {
    return formatTeamRoster(record) ?? JSON.stringify(record);
  }
  if (isPresentedCategoryTeams(record)) {
    return formatCategoryTeams(record) ?? JSON.stringify(record);
  }
  if (isPresentedPlayerLike(record)) {
    return formatPlayerLike(record) ?? JSON.stringify(record);
  }
  if (isPresentedStandingTeam(record)) {
    return formatStandingTeam(record) ?? JSON.stringify(record);
  }
  if (isPresentedCategory(record)) {
    return formatCategoryLike(record) ?? JSON.stringify(record);
  }
  return JSON.stringify(record);
}

export function formatToolValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Sin resultados.';
    }

    const lines = value.map((entry) => {
      if (isRecord(entry)) {
        return formatRecord(entry);
      }
      return String(entry);
    });

    if (lines.every((line) => !line.includes('\n'))) {
      return asMarkdownList(lines);
    }

    return joinMarkdownBlocks(lines);
  }

  if (isRecord(value)) {
    return formatRecord(value);
  }

  return String(value);
}
