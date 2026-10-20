import { formatToolText } from './format-tool-text';
import { pickPreferredToolResults } from './pick-preferred-tool-results';

const UNFORMATTED_FALLBACK
  = 'He recibido una respuesta de las herramientas, pero no pude redactarla.';

function buildFallbackBody(toolResults: string[]): string {
  return pickPreferredToolResults(toolResults)
    .map((text) => formatToolText(text))
    .filter(Boolean)
    .join('\n\n')
    .trim();
}

function looksLikeRawJson(text: string): boolean {
  const trimmed = text.trim();
  return trimmed.startsWith('{') || trimmed.startsWith('[');
}

export function tryFormatToolResultFallback(
  toolResults: string[],
): string | null {
  const body = buildFallbackBody(toolResults);
  if (!body || looksLikeRawJson(body)) {
    return null;
  }

  return body;
}

export function formatToolResultFallback(toolResults: string[]): string {
  return buildFallbackBody(toolResults) || UNFORMATTED_FALLBACK;
}
