import { foldText } from '@padel-cantabria/shared';
import { asksForCategoryTeams } from './category-teams-intent';

/**
 * True when the user asks to list categories (full catalog or filtered).
 * Examples: "qué categorías hay?", "qué categorías hay en tercera?".
 */
export function asksForCategoryCatalog(text: string): boolean {
  if (asksForCategoryTeams(text)) {
    return false;
  }

  const normalized = foldText(text);

  if (/\bequipos?\b|\bteams?\b/.test(normalized)) {
    return false;
  }

  const mentionsCategories = /\bcategorias?\b|\bcategories\b/.test(normalized);
  if (!mentionsCategories) {
    return false;
  }

  return /\b(?:que|qué|cuales|cuáles|hay|lista|listar|mostrar|todas?|dime|show|list|which|what|all)\b/.test(
    normalized,
  );
}
