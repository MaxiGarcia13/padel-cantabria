import type { CallTool } from '@chat/call-tool.js';
import type { ChatTurnResult } from './chat-turn-result.js';
import type { PendingCategoryClarification } from './clarification.js';
import { inferGenderFromText } from '@padel-cantabria/shared';
import { chatTurnResult } from './chat-turn-result.js';
import {
  formatCategoryClarification,
  formatUnknownCategoryMessage,
  parseCategoryPick,
  parseCategoryToolError,

} from './clarification.js';
import { formatToolResultFallback } from './tool-result-fallback/index.js';

const INVALID_PICK_HINT
  = 'No entendí la elección. Indica el número de la lista o el nombre de la categoría.';

export async function resolvePendingCategoryPick(options: {
  callTool: CallTool;
  pending: PendingCategoryClarification;
  userReply: string;
}): Promise<ChatTurnResult | null> {
  const pick = parseCategoryPick(options.userReply, options.pending.options);

  if (!pick) {
    // Gender-only reply or brand-new question → let the normal turn handle it.
    if (inferGenderFromText(options.userReply)) {
      return null;
    }

    if (options.pending.options.length === 0) {
      return chatTurnResult(formatUnknownCategoryMessage());
    }

    return chatTurnResult(
      `${INVALID_PICK_HINT}\n\n${formatCategoryClarification(options.pending.options)}`,
      options.pending,
    );
  }

  const toolText = await options.callTool('list_teams', {
    gender: options.pending.gender,
    category: pick.category_value,
    ...(pick.phase_value
      ? { phase: pick.phase_value }
      : {}),
  });

  const categoryError = parseCategoryToolError(toolText);
  if (categoryError) {
    if (
      categoryError.code === 'unknown_category'
      && categoryError.candidates.length === 0
    ) {
      return chatTurnResult(formatUnknownCategoryMessage());
    }

    return chatTurnResult(
      formatCategoryClarification(categoryError.candidates),
      {
        kind: 'category',
        options: categoryError.candidates,
        originalQuestion: options.pending.originalQuestion,
        gender: options.pending.gender,
      },
    );
  }

  return chatTurnResult(formatToolResultFallback([toolText]));
}
