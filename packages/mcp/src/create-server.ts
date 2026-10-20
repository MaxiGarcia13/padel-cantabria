import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import {
  MCP_TOOLS,
  toolError,
  toolResult,
} from '@padel-cantabria/mcp-tools';
import packageJson from '../package.json';
import { assistantGet } from './assistant-client.js';

export function createStdioMcpServer(): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  server.registerTool(
    'list_categories',
    MCP_TOOLS.list_categories,
    async () => {
      try {
        return toolResult(await assistantGet('/categories'));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_categories',
    MCP_TOOLS.search_categories,
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/categories/search', {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_phases',
    MCP_TOOLS.search_phases,
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/phases/search', {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'list_teams',
    MCP_TOOLS.list_teams,
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/teams', {
            gender: args.gender,
            category: args.category,
            phase: args.phase,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    MCP_TOOLS.search_teams,
    async ({ query, limit }) => {
      try {
        return toolResult(
          await assistantGet('/teams/search', { q: query, limit }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_team_overview',
    MCP_TOOLS.get_team_overview,
    async ({ team_id: teamId, phase }) => {
      try {
        return toolResult(
          await assistantGet(`/teams/${teamId}/overview`, { phase }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'list_team_players',
    MCP_TOOLS.list_team_players,
    async ({ team_id: teamId }) => {
      try {
        return toolResult(await assistantGet(`/teams/${teamId}/players`));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_players',
    MCP_TOOLS.search_players,
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/search', {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_top_players',
    MCP_TOOLS.get_top_players,
    async (args) => {
      try {
        return toolResult(
          await assistantGet('/players/top', {
            gender: args.gender,
            category: args.category,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  return server;
}
