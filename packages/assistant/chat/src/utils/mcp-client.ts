import type { ChatCompletionTool } from './chat-completion-types';

interface JsonRpcSuccess {
  result?: unknown;
  error?: { message?: string };
}

interface McpTool {
  name: string;
  description?: string;
  inputSchema?: Record<string, unknown>;
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  return value as Record<string, unknown>;
}

function parseSseJson(text: string): unknown {
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

export class McpBrowserClient {
  private nextId = 1;
  private sessionId: string | null = null;
  private readonly endpoint: string;

  constructor(endpoint = '/mcp') {
    this.endpoint = endpoint;
  }

  async connect(): Promise<void> {
    await this.request('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'padel-cantabria-chat',
        version: '0.0.1',
      },
    });

    await this.notify('notifications/initialized');
  }

  async listTools(): Promise<McpTool[]> {
    const result = asRecord(await this.request('tools/list', {}));
    const tools = result?.tools;

    if (!Array.isArray(tools)) {
      return [];
    }

    return tools.filter((tool): tool is McpTool => {
      const record = asRecord(tool);
      return Boolean(record && typeof record.name === 'string');
    }) as McpTool[];
  }

  async callTool(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<string> {
    const result = asRecord(
      await this.request('tools/call', {
        name,
        arguments: args,
      }),
    );

    const content = result?.content;

    if (!Array.isArray(content)) {
      return JSON.stringify(result ?? {});
    }

    return content
      .map((entry) => {
        const record = asRecord(entry);
        if (record && typeof record.text === 'string') {
          return record.text;
        }
        return JSON.stringify(entry);
      })
      .join('\n');
  }

  toOpenAiTools(tools: McpTool[]): ChatCompletionTool[] {
    return tools.map((tool) => ({
      type: 'function',
      function: {
        name: tool.name,
        description: tool.description ?? tool.name,
        parameters: tool.inputSchema ?? {
          type: 'object',
          properties: {},
        },
      },
    }));
  }

  private async notify(method: string): Promise<void> {
    await this.post({ jsonrpc: '2.0', method }, { allowEmpty: true });
  }

  private async request(
    method: string,
    params: Record<string, unknown>,
  ): Promise<unknown> {
    const id = this.nextId;
    this.nextId += 1;

    const payload = await this.post({
      jsonrpc: '2.0',
      id,
      method,
      params,
    });

    const body = asRecord(payload) as JsonRpcSuccess | null;

    if (!body) {
      throw new Error(`Invalid MCP response for ${method}`);
    }

    if (body.error) {
      throw new Error(body.error.message ?? `MCP error in ${method}`);
    }

    return body.result;
  }

  private async post(
    body: Record<string, unknown>,
    options: { allowEmpty?: boolean } = {},
  ): Promise<unknown> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/event-stream',
    };

    if (this.sessionId) {
      headers['mcp-session-id'] = this.sessionId;
    }

    const response = await fetch(this.endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const nextSession = response.headers.get('mcp-session-id');
    if (nextSession) {
      this.sessionId = nextSession;
    }

    const text = await response.text();

    if (!response.ok) {
      throw new Error(
        `MCP HTTP ${response.status}: ${text || response.statusText}`,
      );
    }

    if (!text.trim()) {
      if (options.allowEmpty || response.status === 202) {
        return null;
      }

      throw new Error('Empty MCP response body');
    }

    const contentType = response.headers.get('content-type') ?? '';

    if (contentType.includes('text/event-stream')) {
      return parseSseJson(text);
    }

    return JSON.parse(text) as unknown;
  }
}
