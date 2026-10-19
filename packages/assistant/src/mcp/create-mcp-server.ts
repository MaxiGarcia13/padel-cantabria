import type { DatabaseClient } from '../db.js';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import packageJson from '@package-json';
import { z } from 'zod';
import { getTeamOverview } from '../handlers/get-team-overview.js';
import { getTopPlayersHandler } from '../handlers/get-top-players.js';
import { listCategories } from '../handlers/list-categories.js';
import { searchPlayersHandler } from '../handlers/search-players.js';
import { searchTeamsHandler } from '../handlers/search-teams.js';
import { toolError, toolResult } from './tool-result.js';

export function createMcpServer(db: DatabaseClient): McpServer {
  const server = new McpServer({
    name: 'padel-cantabria',
    version: packageJson.version,
  });

  server.registerTool(
    'list_categories',
    {
      description:
        'List leagues with genders, phases, and categories (values and Spanish labels).',
    },
    async () => {
      try {
        return toolResult(await listCategories(db));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_teams',
    {
      description: 'Search teams by name. Returns id, league, gender, category.',
      inputSchema: {
        query: z.string().optional().describe('Team name fragment'),
        limit: z.number().int().positive().optional().describe('Max results'),
      },
    },
    async ({ query, limit }) => {
      try {
        return toolResult(
          await searchTeamsHandler(db, { q: query, limit }),
        );
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'get_team_overview',
    {
      description:
        'Team competition context, standing/position, and next match for a phase.',
      inputSchema: {
        team_id: z.number().int().positive().describe('Team id from search_teams'),
        phase: z
          .string()
          .optional()
          .describe('Phase value; defaults to the first available phase'),
      },
    },
    async ({ team_id: teamId, phase }) => {
      try {
        return toolResult(await getTeamOverview(db, teamId, phase));
      } catch (error) {
        return toolError(error);
      }
    },
  );

  server.registerTool(
    'search_players',
    {
      description:
        'Search players by name or surname. Returns points, team, and category.',
      inputSchema: {
        query: z.string().optional().describe('Player name or surname'),
        league_id: z.number().int().positive().optional(),
        gender: z.string().optional(),
        category: z.string().optional(),
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await searchPlayersHandler(db, {
            q: args.query,
            league_id: args.league_id,
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

  server.registerTool(
    'get_top_players',
    {
      description: 'Players with most points in a league gender/category.',
      inputSchema: {
        league_id: z.number().int().positive(),
        gender: z.string(),
        category: z.string(),
        limit: z.number().int().positive().optional(),
      },
    },
    async (args) => {
      try {
        return toolResult(
          await getTopPlayersHandler(db, {
            league_id: args.league_id,
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
