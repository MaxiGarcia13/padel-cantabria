import { inferGenderFromText } from '@padel-cantabria/shared';

export interface ListTeamsArgs {
  gender: 'M' | 'F';
  category: string;
}

export function resolveListTeamsArgs(userMessage: string): ListTeamsArgs | null {
  const gender = inferGenderFromText(userMessage);
  const category = userMessage.trim();

  if (!gender || !category) {
    return null;
  }

  return { gender, category };
}
