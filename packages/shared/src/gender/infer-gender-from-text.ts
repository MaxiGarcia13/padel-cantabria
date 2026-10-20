import { foldText } from '../text/fold-text.js';

/** Detect M/F from free-text (chat / natural language). */
export function inferGenderFromText(text: string): 'M' | 'F' | undefined {
  const normalized = foldText(text);

  if (/\b(?:m|masc|masculin[oa]?)\b/.test(normalized)) {
    return 'M';
  }

  if (/\b(?:f|fem|femenin[oa]?)\b/.test(normalized)) {
    return 'F';
  }

  return undefined;
}
