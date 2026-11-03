export async function readOpenAiNdjsonStream(
  response: Response,
  onDelta: (text: string) => void,
): Promise<string> {
  if (!response.body) {
    throw new Error('Chat response has no body');
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let fullText = '';

  const consumeLine = (line: string) => {
    const trimmed = line.trim();
    if (!trimmed) {
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(trimmed);
    } catch {
      throw new Error('Invalid chat stream chunk');
    }

    if (
      parsed
      && typeof parsed === 'object'
      && 'error' in parsed
      && typeof (parsed as { error: unknown }).error === 'string'
    ) {
      throw new Error((parsed as { error: string }).error);
    }

    const content = (
      parsed as {
        choices?: Array<{ delta?: { content?: string | null } }>;
      }
    ).choices?.[0]?.delta?.content;

    if (typeof content === 'string' && content.length > 0) {
      fullText += content;
      onDelta(content);
    }
  };

  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop() ?? '';

    for (const line of lines) {
      consumeLine(line);
    }
  }

  if (buffer.trim()) {
    consumeLine(buffer);
  }

  return fullText;
}

export function readPendingHeader(response: Response): unknown | null {
  const raw = response.headers.get('X-Chat-Pending');
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(decodeURIComponent(raw));
  } catch {
    return null;
  }
}
