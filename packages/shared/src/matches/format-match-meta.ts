import type { Match } from '@padel-cantabria/database';

type MatchMetaFields = Pick<Match, 'date' | 'location' | 'rounds'>;

export function formatMatchMetaParts(match: MatchMetaFields): string[] {
  const parts: string[] = [];

  if (match.date) {
    parts.push(match.date);
  }

  if (match.rounds) {
    parts.push(`Tandas: ${match.rounds}`);
  }

  if (match.location) {
    parts.push(match.location);
  }

  return parts;
}

export function formatMatchMeta(match: MatchMetaFields): string {
  return formatMatchMetaParts(match).join(' · ');
}
