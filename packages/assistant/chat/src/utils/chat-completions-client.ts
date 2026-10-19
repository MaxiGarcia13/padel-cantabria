import type {
  ChatCompletion,
  ChatCompletionCreateParams,
  ChatCompletionsClient,
} from './chat-completion-types';

export class HttpChatCompletionsClient implements ChatCompletionsClient {
  constructor(private readonly endpoint = '/chat/completions') {}

  async create(params: ChatCompletionCreateParams): Promise<ChatCompletion> {
    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    const payload: unknown = await response.json().catch(() => null);

    if (!response.ok) {
      const message = readErrorMessage(payload) ?? response.statusText;
      throw new Error(`Chat HTTP ${response.status}: ${message}`);
    }

    if (!isChatCompletion(payload)) {
      throw new Error('Invalid chat completion response');
    }

    return payload;
  }
}

function readErrorMessage(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') {
    return null;
  }

  const error = (payload as { error?: unknown }).error;
  return typeof error === 'string' ? error : null;
}

function isChatCompletion(value: unknown): value is ChatCompletion {
  if (!value || typeof value !== 'object') {
    return false;
  }

  const choices = (value as { choices?: unknown }).choices;
  return Array.isArray(choices);
}
