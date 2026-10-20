import type { DatabaseClient } from '@padel-cantabria/database';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import packageJson from '@package-json';
import {
  MCP_TOOLS,
  toolError,
  toolResult,
} from '@padel-cantabria/mcp-tools';
import { getTeamOverview } from '../handlers/get-team-overview.js';
import { getTopPlayersHandler } from '../handlers/get-top-players.js';
import { listCategories } from '../handlers/list-categories.js';
import { listTeamPlayersHandler } from '../handlers/list-team-players.js';
import { listTeamsHandler } from '../handlers/list-teams.js';
import { searchCategoriesHandler } from '../handlers/search-categories.js';
import { searchPhasesHandler } from '../handlers/search-phases.js';
import { searchPlayersHandler } from '../handlers/search-players.js';
import { searchTeamsHandler } from '../handlers/search-teams.js';
import { serializeToolError } from './serialize-tool-error.js';

export function createMcpServer(db: DatabaseClient): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  const onError = (error: unknown) => toolError(error, serializeToolError);

  server.registerTool(
    'list_categories',
    MCP_TOOLS.list_categories,
    async () => {
      try {
        return toolResult(await listCategories(db));
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
        return toolResult(
          await searchCategoriesHandler(db, {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
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
        return toolResult(
          await searchPhasesHandler(db, {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
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
        return toolResult(
          await listTeamsHandler(db, {
            gender: args.gender,
            category: args.category,
            phase: args.phase,
          }),
        );
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    MCP_TOOLS.search_teams,
    async ({ query, limit }) => {
      try {
        return toolResult(
          await searchTeamsHandler(db, { q: query, limit }),
        );
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'get_team_overview',
    MCP_TOOLS.get_team_overview,
    async ({ team_id: teamId, phase }) => {
      try {
        return toolResult(await getTeamOverview(db, teamId, phase));
      } catch (error) {
        return onError(error);
      }
    },
  );

  server.registerTool(
    'list_team_players',
    MCP_TOOLS.list_team_players,
    async ({ team_id: teamId }) => {
      try {
        return toolResult(await listTeamPlayersHandler(db, teamId));
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
        return toolResult(
          await searchPlayersHandler(db, {
            q: args.query,
            gender: args.gender,
            limit: args.limit,
          }),
        );
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
        return toolResult(
          await getTopPlayersHandler(db, {
            gender: args.gender,
            category: args.category,
            limit: args.limit,
          }),
        );
      } catch (error) {
        return onError(error);
      }
    },
  );

  return server;
}
