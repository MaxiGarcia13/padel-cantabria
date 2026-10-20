import type { ChatTurnResult } from '../chat-turn-result';
import type { PendingCategoryClarification } from '../clarification';
import { inferGenderFromText } from '@padel-cantabria/shared';
import { chatTurnResult } from '../chat-turn-result';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryToolError,
} from '../clarification';

export function clarificationFromToolResults(
  toolResults: string[],
  userMessage: string,
): ChatTurnResult | null {
  const gender = inferGenderFromText(userMessage);

  for (let index = toolResults.length - 1; index >= 0; index -= 1) {
    const error = parseCategoryToolError(toolResults[index]!);
    if (!error) {
      continue;
    }

    if (error.code === 'unknown_category' && error.candidates.length === 0) {
      return chatTurnResult(formatUnknownCategoryMessage());
    }

    const text = formatCategoryClarification(error.candidates);
    if (!gender || error.candidates.length === 0) {
      return chatTurnResult(text);
    }

    const pending: PendingCategoryClarification = {
      kind: 'category',
      options: error.candidates,
      originalQuestion: userMessage,
      gender,
    };

    return chatTurnResult(text, pending);
  }

  return null;
}
