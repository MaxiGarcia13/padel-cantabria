import type { ChatOutcome } from './chat-outcome.js';
import { buildFollowUpSuggestions } from './follow-up-suggestions.js';

export function withFollowUpSuggestions(
  outcome: ChatOutcome,
  options: {
    toolResults: string[];
    userMessage: string;
  },
): ChatOutcome {
  if (outcome.pending) {
    return outcome;
  }

  const suggestions = buildFollowUpSuggestions(options);
  if (suggestions.length === 0) {
    return outcome;
  }

  return {
    ...outcome,
    suggestions,
  };
}
