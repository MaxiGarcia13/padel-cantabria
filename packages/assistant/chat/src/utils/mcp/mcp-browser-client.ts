import type { ChatCompletionTool } from '../chat-completion-types';
import type { McpTool } from './mcp-parse';
import { notifyJsonRpc, requestJsonRpc } from './mcp-json-rpc';
import { asRecord } from './mcp-parse';

export class McpBrowserClient {
  private nextId = 1;
  private sessionId: string | null = null;
  private readonly endpoint: string;

  constructor(endpoint = '/mcp') {
    this.endpoint = endpoint;
  }

  async connect(): Promise<void> {
    const initialized = await requestJsonRpc(
      this.endpoint,
      'initialize',
      {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'padel-cantabria-chat',
          version: '0.0.1',
        },
      },
      this.sessionId,
      this.nextId,
    );
    this.nextId += 1;
    this.sessionId = initialized.sessionId;

    this.sessionId = await notifyJsonRpc(
      this.endpoint,
      'notifications/initialized',
      this.sessionId,
    );
  }

  async listTools(): Promise<McpTool[]> {
    const { result, sessionId } = await requestJsonRpc(
      this.endpoint,
      'tools/list',
      {},
      this.sessionId,
      this.nextId,
    );
    this.nextId += 1;
    this.sessionId = sessionId;

    const record = asRecord(result);
    const tools = record?.tools;

    if (!Array.isArray(tools)) {
      return [];
    }

    return tools.filter((tool): tool is McpTool => {
      const toolRecord = asRecord(tool);
      return Boolean(toolRecord && typeof toolRecord.name === 'string');
    }) as McpTool[];
  }

  async callTool(
    name: string,
    args: Record<string, unknown> = {},
  ): Promise<string> {
    const { result, sessionId } = await requestJsonRpc(
      this.endpoint,
      'tools/call',
      {
        name,
        arguments: args,
      },
      this.sessionId,
      this.nextId,
    );
    this.nextId += 1;
    this.sessionId = sessionId;

    const record = asRecord(result);
    const content = record?.content;

    if (!Array.isArray(content)) {
      return JSON.stringify(result ?? {});
    }

    return content
      .map((entry) => {
        const entryRecord = asRecord(entry);
        if (entryRecord && typeof entryRecord.text === 'string') {
          return entryRecord.text;
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
}
