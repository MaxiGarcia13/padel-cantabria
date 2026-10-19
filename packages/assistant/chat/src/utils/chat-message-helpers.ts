import type { ChatCompletionMessageParam } from './chat-completion-types';

export function withoutSystemMessages(
  messages: ChatCompletionMessageParam[],
): ChatCompletionMessageParam[] {
  return messages.filter((message) => message.role !== 'system');
}

export function previousUserMessages(
  history: ChatCompletionMessageParam[],
): string[] {
  return history
    .filter((message) => message.role === 'user')
    .map((message) => {
      const content = message.content;
      return typeof content === 'string' ? content : '';
    })
    .filter(Boolean);
}

export function formatToolResult(name: string, toolText: string): string {
  return `Resultado de ${name}:\n${toolText}`;
}

export function parseToolArguments(
  raw: string | undefined,
): Record<string, unknown> {
  if (!raw) {
    return {};
  }

  try {
    const parsed: unknown = JSON.parse(raw);
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) {
      return parsed as Record<string, unknown>;
    }
  } catch {
    return { raw };
  }

  return {};
}
