import process from 'node:process';

const DEFAULT_ASSISTANT_URL = 'http://127.0.0.1:3001';

export function getAssistantBaseUrl(): string {
  const raw = process.env.ASSISTANT_URL ?? DEFAULT_ASSISTANT_URL;

  return raw.replace(/\/$/, '');
}

export async function assistantGet(
  path: string,
  query: Record<string, string | number | undefined> = {},
): Promise<unknown> {
  const url = new URL(path, `${getAssistantBaseUrl()}/`);

  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === '') {
      continue;
    }

    url.searchParams.set(key, String(value));
  }

  const response = await fetch(url);

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      `Assistant API ${response.status}: ${body || response.statusText}`,
    );
  }

  return response.json();
}
