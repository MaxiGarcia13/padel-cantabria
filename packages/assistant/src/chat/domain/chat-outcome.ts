import type { writeNdjsonStream } from '@maxigarcia/ai-router';
import type { ChatResult } from './chat-result.js';
import type { PendingClarification } from './clarification.js';
import { contentChunks } from '../content-chunks.js';

type NdjsonStream = Parameters<typeof writeNdjsonStream>[0];

export interface ChatOutcome {
  chunks: NdjsonStream;
  pending?: PendingClarification;
  suggestions?: string[];
}

export function chatOutcome(
  chunks: NdjsonStream,
  pending?: PendingClarification,
  suggestions?: string[],
): ChatOutcome {
  return {
    chunks,
    ...(pending
      ? { pending }
      : {}),
    ...(suggestions && suggestions.length > 0
      ? { suggestions }
      : {}),
  };
}

export function chatOutcomeFromResult(result: ChatResult): ChatOutcome {
  return chatOutcome(contentChunks(result.text), result.pending);
}
