import type { ChatCompletionTool } from './utils/chat-completion-types.js';
import { MCP_TOOLS } from '@padel-cantabria/mcp-tools';
import { z } from 'zod';

type ToolDefinition = (typeof MCP_TOOLS)[keyof typeof MCP_TOOLS];

function parametersFromTool(tool: ToolDefinition): Record<string, unknown> {
  if (!('inputSchema' in tool) || tool.inputSchema === undefined) {
    return { type: 'object', properties: {} };
  }

  const jsonSchema = z.toJSONSchema(z.object(tool.inputSchema));
  const { $schema: _schema, ...parameters } = jsonSchema as Record<
    string,
    unknown
  > & { $schema?: unknown };

  return parameters;
}

export function mcpToolsAsOpenAi(): ChatCompletionTool[] {
  return (Object.keys(MCP_TOOLS) as Array<keyof typeof MCP_TOOLS>).map(
    (name) => {
      const tool = MCP_TOOLS[name];
      return {
        type: 'function' as const,
        function: {
          name,
          description: tool.description,
          parameters: parametersFromTool(tool),
        },
      };
    },
  );
}
