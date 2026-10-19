import { asksForCategoryTeams } from './category-teams-intent';

function fold(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * True when the user asks to list the category catalog (not teams in a category).
 * Examples: "qué categorías hay?", "listar categorias".
 */
export function asksForCategoryCatalog(text: string): boolean {
  if (asksForCategoryTeams(text)) {
    return false;
  }

  const normalized = fold(text);

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
