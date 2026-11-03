import { foldText, inferGenderFromText } from '@padel-cantabria/shared';

export const ASK_GENDER_MESSAGE
  = '¿Masculino (M) o femenino (F)?';

export function asksForCategoryTeams(text: string): boolean {
  const normalized = foldText(text);

  return (
    /\bequipos?\b|\bteams?\b/.test(normalized)
    && /\bcategoria\b|\bgrupo\b|\bcategory\b|\bgroup\b/.test(normalized)
  );
}

export function needsGenderClarification(text: string): boolean {
  return asksForCategoryTeams(text) && !inferGenderFromText(text);
}

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
