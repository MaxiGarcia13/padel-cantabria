import type { McpToolHandlers } from '@padel-cantabria/mcp-tools';
import { MCP_TOOLS } from '@padel-cantabria/mcp-tools';
import { serializeToolError } from '../mcp/serialize-tool-error.js';

export type CallTool = (
  name: string,
  args?: Record<string, unknown>,
) => Promise<string>;

function isMcpToolName(name: string): name is keyof McpToolHandlers {
  return Object.hasOwn(MCP_TOOLS, name);
}

export function createCallTool(handlers: McpToolHandlers): CallTool {
  return async (name, args = {}) => {
    if (!isMcpToolName(name)) {
      return JSON.stringify({ error: `Unknown tool: ${name}` });
    }

    try {
      const data = await handlers[name](args as never);
      return JSON.stringify(data);
    } catch (error) {
      const payload = serializeToolError(error);
      if (payload !== undefined) {
        return JSON.stringify(payload);
      }

      return error instanceof Error
        ? error.message
        : 'Unknown error';
    }
  };
}
