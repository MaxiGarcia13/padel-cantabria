import type { AiRouterInterface } from '@maxigarcia/ai-router';
import process from 'node:process';
import { AiRouter } from '@maxigarcia/ai-router';

export function getAiRouter(): AiRouterInterface {
  return AiRouter({
    fallback: [
      'gemini',
      'open-router',
    ],
    providers: {
      'gemini': {
        apiKey: process.env.GEMINI_API_KEY!,
      },
      'open-router': {
        apiKey: process.env.OPEN_ROUTER_API_KEY!,
      },
    },
  });
}
