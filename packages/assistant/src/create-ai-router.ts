import type { AiRouterCompletionParams, AiRouterInterface } from '@maxigarcia/ai-router';
import process from 'node:process';
import { AiRouter } from '@maxigarcia/ai-router';

export function createAiRouter(
  options: AiRouterCompletionParams,
): AiRouterInterface | null {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  return AiRouter({
    fallback: [
      'gemini',
    ],
    providers: {
      gemini: {
        ...options,
        apiKey,
      },
    },
  });
}
