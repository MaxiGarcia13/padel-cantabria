import { formatToolText } from './format-tool-text';
import { pickPreferredToolResults } from './pick-preferred-tool-results';

/**
 * Deterministic Spanish fallback when the model returns empty content
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
