import type { ChatResult } from './chat-result.js';
import type { PendingCategoryClarification } from './clarification.js';
import { inferGenderFromText } from '@padel-cantabria/shared';
import { chatResult } from './chat-result.js';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,
} from './clarification.js';

export function clarificationFromToolResults(
  toolResults: string[],
  userMessage: string,
): ChatResult | null {
  const gender = inferGenderFromText(userMessage);

  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const error = parseCategoryToolError(toolResults[index]!);
    if (!error) {
      continue;
    }

    if (error.code === 'unknown_category' && error.candidates.length === 0) {
      return chatResult(formatUnknownCategoryMessage());
    }

    const text = formatCategoryClarification(error.candidates);
    if (!gender || error.candidates.length === 0) {
      return chatResult(text);
    }

    const pending: PendingCategoryClarification = {
      kind: 'category',
      options: error.candidates,
      originalQuestion: userMessage,
      gender,
    };

    return chatResult(text, pending);
  }

  return null;
}
