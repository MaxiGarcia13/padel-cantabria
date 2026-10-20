import { foldText, inferGenderFromText } from '@padel-cantabria/shared';

/** Spanish UI copy when category-team questions omit gender. */
export const ASK_GENDER_MESSAGE
  = '¿Masculino (M) o femenino (F)?';

/** True when the user asks which teams are in a category/group. */
export function asksForCategoryTeams(text: string): boolean {
  const normalized = foldText(text);

  return (
    /\bequipos?\b|\bteams?\b/.test(normalized)
    && /\bcategoria\b|\bgrupo\b|\bcategory\b|\bgroup\b/.test(normalized)
  );
}

/** Category-team question without an explicit gender → ask before calling tools. */
export function needsGenderClarification(text: string): boolean {
  return asksForCategoryTeams(text) && !inferGenderFromText(text);
}

/**
 * If the latest message is only a gender reply, merge it with the previous
 * category-teams question from history so follow-ups still resolve.
 */
export function mergeGenderFollowUp(
  userMessage: string,
  previousUserMessages: string[],
): string {
  if (asksForCategoryTeams(userMessage)) {
    return userMessage;
  }

  if (!inferGenderFromText(userMessage)) {
    return userMessage;
  }

  for (let index = previousUserMessages.length - 1; index >= 0; index -= 1) {
    const previous = previousUserMessages[index]!;
    if (needsGenderClarification(previous)) {
      return `${previous} ${userMessage.trim()}`;
    }
  }

  return userMessage;
}
