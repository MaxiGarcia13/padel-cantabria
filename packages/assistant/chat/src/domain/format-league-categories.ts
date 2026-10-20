import { isRecord, parseToolJson } from '../utils/parse-tool-json';

function asString(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export function formatLeagueCategories(toolText: string): string {
  const parsed = parseToolJson(toolText);
  if (!Array.isArray(parsed) || parsed.length === 0) {
    return 'No hay categorías disponibles.';
  }

  const blocks: string[] = [];

  for (const leagueEntry of parsed) {
    if (!isRecord(leagueEntry)) {
      continue;
    }

    const leagueName = asString(leagueEntry.league) || 'Liga';
    const genders = Array.isArray(leagueEntry.genders) ? leagueEntry.genders : [];
    const leagueLines = [leagueName];

    for (const genderEntry of genders) {
      if (!isRecord(genderEntry)) {
        continue;
      }

      const genderLabel = asString(genderEntry.gender) || asString(genderEntry.gender_code);
      if (genderLabel) {
        leagueLines.push('');
        leagueLines.push(genderLabel);
      }

      const phases = Array.isArray(genderEntry.phases) ? genderEntry.phases : [];
      for (const phaseEntry of phases) {
        if (!isRecord(phaseEntry)) {
          continue;
        }

        const phaseLabel = asString(phaseEntry.phase);
        const categories = Array.isArray(phaseEntry.categories)
          ? phaseEntry.categories
          : [];

        if (phaseLabel && categories.length > 0) {
          leagueLines.push('');
          leagueLines.push(phaseLabel);
        }

        for (const categoryEntry of categories) {
          if (!isRecord(categoryEntry)) {
            continue;
          }
          const categoryLabel = asString(categoryEntry.category);
          if (categoryLabel) {
            leagueLines.push(`- ${categoryLabel}`);
          }
        }
      }
    }

    if (leagueLines.length > 1) {
      blocks.push(leagueLines.join('\n'));
    }
  }

  return blocks.length > 0 ? blocks.join('\n\n') : 'No hay categorías disponibles.';
}
