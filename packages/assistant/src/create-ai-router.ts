import type { AiRouterInterface } from '@maxigarcia/ai-router';
import process from 'node:process';
import { AiRouter } from '@maxigarcia/ai-router';

export function getAiRouter(): AiRouterInterface {
  const geminiApiKey = process.env.GEMINI_API_KEY!;

  return AiRouter({
    fallback: [
      'gemini',
    ],
    providers: {
      gemini: {
        apiKey: geminiApiKey,
      },
    },
  });
}
