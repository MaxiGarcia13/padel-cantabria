import type { AiRouterInterface } from '@maxigarcia/ai-router';
import process from 'node:process';
import { AiRouter } from '@maxigarcia/ai-router';

type ProviderName = 'gemini';

const PROVIDER_ENV: ReadonlyArray<{
  name: ProviderName;
  env: string;
}> = [
  { name: 'gemini', env: 'GEMINI_API_KEY' },
];

/** OpenAI chat extras merged into each provider (`tools`, `tool_choice`, …). */
export interface AiRouterRequestOptions {
  tools?: unknown;
  tool_choice?: unknown;
}

export function createAiRouter(
  requestOptions: AiRouterRequestOptions = {},
): AiRouterInterface | null {
  const fallback: ProviderName[] = [];
  const providers: Partial<
    Record<ProviderName, { apiKey: string } & AiRouterRequestOptions>
  > = {};

  for (const { name, env } of PROVIDER_ENV) {
    const apiKey = process.env[env]?.trim();
    if (!apiKey) {
      continue;
    }

    fallback.push(name);
    providers[name] = {
      apiKey,
      ...requestOptions,
    };
  }

  if (fallback.length === 0) {
    return null;
  }

  return AiRouter({
    fallback,
    providers,
  } as Parameters<typeof AiRouter>[0]);
}
