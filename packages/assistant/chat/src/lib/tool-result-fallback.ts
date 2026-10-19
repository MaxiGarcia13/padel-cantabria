function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

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

function formatValue(value: unknown): string {
  if (Array.isArray(value)) {
    if (value.length === 0) {
      return 'Sin resultados.';
    }

    return value
      .map((entry) => {
        if (isRecord(entry)) {
          return formatPlayerLike(entry) ?? JSON.stringify(entry);
        }
        return String(entry);
      })
      .join('\n');
  }

  if (isRecord(value)) {
    return formatPlayerLike(value) ?? JSON.stringify(value, null, 2);
  }

  return String(value);
}

function formatToolText(toolText: string): string {
  try {
    return formatValue(JSON.parse(toolText) as unknown);
  } catch {
    return toolText.trim();
  }
}

/**
 * Deterministic Spanish-ish fallback when the local model returns empty content
 * after a successful tool call.
 */
export function formatToolResultFallback(toolResults: string[]): string {
  const body = toolResults
    .map((text) => formatToolText(text))
    .filter(Boolean)
    .join('\n\n')
    .trim();

  if (!body) {
    return 'He recibido una respuesta de las herramientas, pero no pude redactarla.';
  }

  return body;
}
