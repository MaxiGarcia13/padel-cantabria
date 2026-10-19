import { isRecord, parseToolJson } from '../utils/parse-tool-json';

function formatPlayerLike(record: Record<string, unknown>): string | null {
  const nameParts = [record.name, record.surname]
    .filter((part): part is string => typeof part === 'string' && part.trim() !== '')
    .map((part) => part.trim());

  if (nameParts.length === 0) {
    return null;
  }

  const parts = [nameParts.join(' ')];

  if (typeof record.team === 'string' && record.team.trim()) {
    parts.push(`equipo ${record.team.trim()}`);
  }

  if (typeof record.category === 'string' && record.category.trim()) {
    parts.push(record.category.trim());
  }

  if (typeof record.position === 'number') {
    parts.push(`posición ${record.position}`);
  }

  if (typeof record.points === 'number') {
    parts.push(`${record.points} puntos`);
  }

  return parts.join(' · ');
}

function formatStandingTeam(record: Record<string, unknown>): string | null {
  if (typeof record.name !== 'string' || !record.name.trim()) {
    return null;
  }

  const parts = [record.name.trim()];

  if (typeof record.position === 'number') {
    parts.push(`posición ${record.position}`);
  }

  if (typeof record.points === 'number') {
    parts.push(`${record.points} puntos`);
  }

  return parts.join(' · ');
}

function formatCategoryLike(record: Record<string, unknown>): string | null {
  if (typeof record.category !== 'string' || !record.category.trim()) {
    return null;
  }

  const parts = [record.category.trim()];

  if (typeof record.gender === 'string' && record.gender.trim()) {
    parts.push(record.gender.trim());
  }

  if (typeof record.phase === 'string' && record.phase.trim()) {
    parts.push(record.phase.trim());
  }

  if (typeof record.category_value === 'string' && record.category_value.trim()) {
    parts.push(`id ${record.category_value.trim()}`);
  }

  return parts.join(' · ');
}

function formatCategoryTeams(record: Record<string, unknown>): string | null {
  if (!Array.isArray(record.teams)) {
    return null;
  }

  const header = [
    typeof record.category === 'string' ? record.category.trim() : '',
    typeof record.gender === 'string' ? record.gender.trim() : '',
    typeof record.phase === 'string' ? record.phase.trim() : '',
  ]
    .filter(Boolean)
    .join(' · ');

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

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Sin resultados.';
    }

    return value
      .map((entry) => {
        if (isRecord(entry)) {
          return (
            formatCategoryTeams(entry)
            ?? formatPlayerLike(entry)
            ?? formatStandingTeam(entry)
            ?? formatCategoryLike(entry)
            ?? JSON.stringify(entry)
          );
        }
        return String(entry);
      })
      .join('\n');
  }

  if (isRecord(value)) {
    return (
      formatCategoryTeams(value)
      ?? formatPlayerLike(value)
      ?? formatStandingTeam(value)
      ?? formatCategoryLike(value)
      ?? JSON.stringify(value, null, 2)
    );
  }

  return String(value);
}

function formatToolText(toolText: string): string {
  const parsed = parseToolJson(toolText);
  if (parsed === null) {
    return toolText.trim();
  }

  return formatValue(parsed);
}

/**
 * Prefer the last tool payload that already lists teams (deterministic path).
 */
function pickPreferredToolResults(toolResults: string[]): string[] {
  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const text = toolResults[index]!;
    const parsed = parseToolJson(text);
    if (isRecord(parsed) && Array.isArray(parsed.teams)) {
      return [text];
    }
  }

  return toolResults;
}

/**
 * Deterministic Spanish-ish fallback when the local model returns empty content
 * after a successful tool call.
 */
export function formatToolResultFallback(toolResults: string[]): string {
  const body = pickPreferredToolResults(toolResults)
    .map((text) => formatToolText(text))
    .filter(Boolean)
    .join('\n\n')
    .trim();

  if (!body) {
    return 'He recibido una respuesta de las herramientas, pero no pude redactarla.';
  }

  return body;
}
