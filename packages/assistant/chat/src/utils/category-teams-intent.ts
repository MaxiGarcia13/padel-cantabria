function fold(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/** True when the user asks which teams are in a category/group. */
export function asksForCategoryTeams(text: string): boolean {
  const normalized = fold(text);

  return (
    /\bequipos?\b|\bteams?\b/.test(normalized)
    && /\bcategoria\b|\bgrupo\b|\bcategory\b|\bgroup\b/.test(normalized)
  );
}

export function inferGenderFromText(text: string): 'M' | 'F' | undefined {
  const normalized = fold(text);

  if (/\b(?:m|masc|masculin[oa]?)\b/.test(normalized)) {
    return 'M';
  }

  if (/\b(?:f|fem|femenin[oa]?)\b/.test(normalized)) {
    return 'F';
  }

  return undefined;
}

/** Strip filler words so the remainder can be passed as a category query. */
export function categoryQueryFromUserMessage(text: string): string {
  return text
    .replace(
      /\b(que|qué|cuales|cuáles|hay|en|la|el|los|las|de|del|un|una|me|dime|lista|listar|mostrar|equipos?|teams?|which|what|are|there|in|the|a|an|show|list)\b/gi,
      ' ',
    )
    .replace(/[¿?¡!,.;:]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
