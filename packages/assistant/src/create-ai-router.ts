import type { AiRouterInterface } from '@maxigarcia/ai-router';
import process from 'node:process';
import { AiRouter } from '@maxigarcia/ai-router';

type ProviderName = 'gemini' | 'open-router' | 'groq';

const PROVIDER_ENV: ReadonlyArray<{
  name: ProviderName;
  env: string;
}> = [
  { name: 'gemini', env: 'GEMINI_API_KEY' },
  { name: 'open-router', env: 'OPEN_ROUTER_API_KEY' },
  { name: 'groq', env: 'GROQ_API_KEY' },
];

export function createAiRouter(): AiRouterInterface | null {
  const fallback: ProviderName[] = [];
  const providers: Partial<Record<ProviderName, { apiKey: string }>> = {};

  for (const { name, env } of PROVIDER_ENV) {
    const apiKey = process.env[env]?.trim();
    if (!apiKey) {
      continue;
    }

    fallback.push(name);
    providers[name] = { apiKey };
  }

  if (fallback.length === 0) {
    return null;
  }

  return AiRouter({
    fallback,
    providers,
  } as Parameters<typeof AiRouter>[0]);
}
