export interface JsonRpcSuccess {
  result?: unknown;
  error?: { message?: string };
}

export interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

export function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

export function parseSseJson(text: string): unknown {
  const dataLines = text
    .split('\n')
    .filter((line) => line.startsWith('data:'))
    .map((line) => line.slice(5).trim())
    .filter(Boolean);

  if (dataLines.length === 0) {
    return null;
  }

  return JSON.parse(dataLines[dataLines.length - 1]!);
}
