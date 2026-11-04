import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpToolHandlers, McpToolName } from './types.js';
import { toolError, toolResult } from '../tool-result.js';
import { MCP_TOOLS } from '../tools.js';

type ToolConfig = Parameters<McpServer['registerTool']>[1];

export function registerMcpTools(
  server: McpServer,
  handlers: McpToolHandlers,
  options?: {
    serializeError?: (error: unknown) => unknown | undefined;
  },
): void {
  const onError = (error: unknown) =>
    toolError(error, options?.serializeError);

  for (const name of Object.keys(MCP_TOOLS) as McpToolName[]) {
    const definition = MCP_TOOLS[name];
    const handler = handlers[name];
    const hasInputSchema = 'inputSchema' in definition;

    server.registerTool(name, definition as ToolConfig, async (args) => {
      try {
        const toolArgs = hasInputSchema ? args : undefined;
        return toolResult(await handler(toolArgs as never));
      } catch (error) {
        return onError(error);
      }
    });
  }
}
