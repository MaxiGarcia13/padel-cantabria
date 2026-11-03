import type { McpDatabaseClient } from '@padel-cantabria/database';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import packageJson from '@package-json';
import { registerMcpTools } from '@padel-cantabria/mcp-tools';
import { createMcpHandlers } from './create-mcp-handlers.js';
import { serializeToolError } from './serialize-tool-error.js';

export function createMcpServer(db: McpDatabaseClient): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  registerMcpTools(server, createMcpHandlers(db), {
    serializeError: serializeToolError,
  });

  return server;
}
