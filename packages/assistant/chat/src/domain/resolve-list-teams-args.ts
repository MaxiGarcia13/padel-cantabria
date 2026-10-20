import { inferGenderFromText } from '@padel-cantabria/shared';

export interface ListTeamsArgs {
  gender: 'M' | 'F';
  category: string;
}

/**
 * Build list_teams args from the user question.
 * Category matching (aliases, stopwords, labels) lives on the server —
 * pass the raw message; gender is required and inferred here for the thin router.
 */
export function resolveListTeamsArgs(userMessage: string): ListTeamsArgs | null {
  const gender = inferGenderFromText(userMessage);
  const category = userMessage.trim();

  if (!gender || !category) {
    return null;
  }

  return { gender, category };
}
