import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpToolHandlers } from './types.js';
import { toolError, toolResult } from '../tool-result.js';
import { MCP_TOOLS } from '../tools.js';

export function registerMcpTools(
  server: McpServer,
  handlers: McpToolHandlers,
  options?: {
    serializeError?: (error: unknown) => unknown | undefined;
  },
): void {
  const onError = (error: unknown) =>
    toolError(error, options?.serializeError);

  server.registerTool(
    'list_categories',
    MCP_TOOLS.list_categories,
    async () => {
      try {
        return toolResult(await handlers.list_categories(undefined));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'search_categories',
    MCP_TOOLS.search_categories,
    async (args) => {
      try {
        return toolResult(await handlers.search_categories(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'search_phases',
    MCP_TOOLS.search_phases,
    async (args) => {
      try {
        return toolResult(await handlers.search_phases(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'list_teams',
    MCP_TOOLS.list_teams,
    async (args) => {
      try {
        return toolResult(await handlers.list_teams(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    MCP_TOOLS.search_teams,
    async (args) => {
      try {
        return toolResult(await handlers.search_teams(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'get_team_overview',
    MCP_TOOLS.get_team_overview,
    async (args) => {
      try {
        return toolResult(await handlers.get_team_overview(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'list_team_players',
    MCP_TOOLS.list_team_players,
    async (args) => {
      try {
        return toolResult(await handlers.list_team_players(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'search_players',
    MCP_TOOLS.search_players,
    async (args) => {
      try {
        return toolResult(await handlers.search_players(args));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'get_top_players',
    MCP_TOOLS.get_top_players,
    async (args) => {
      try {
        return toolResult(await handlers.get_top_players(args));
      } catch (error) {
        return onError(error);
      }
    },
  );
}
