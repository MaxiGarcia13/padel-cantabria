import type { McpToolHandlers, McpToolName } from '@padel-cantabria/mcp-tools';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  buildRestRequest,

  registerMcpTools,
  REST_TOOL_ROUTES,
} from '@padel-cantabria/mcp-tools';
import packageJson from '../package.json';
import { assistantGet } from './assistant-client.js';

function createRestToolHandlers(): McpToolHandlers {
  const entries = (Object.keys(REST_TOOL_ROUTES) as McpToolName[]).map(
    (name) =>
      [
        name,
        async (args: never) => {
          const { path, query } = buildRestRequest(name, args);
          return assistantGet(path, query);
        },
      ] as const,
  );

  return Object.fromEntries(entries) as McpToolHandlers;
}

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  registerMcpTools(server, createRestToolHandlers());

  return server;
}
